import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { getDB } from '../db/connect.js';
import { ObjectId } from 'mongodb';

/**
 * GitHub OAuth Configuration
 * Sets up Passport with GitHub strategy for authentication
 */

// GitHub Strategy Configuration
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('🔐 GitHub OAuth callback triggered');
    console.log('👤 GitHub Profile received:', {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value
    });

    const db = await getDB();

    const usersCollection = db.collection('users');

    // Check if user already exists
    let user = await usersCollection.findOne({ githubId: profile.id });
    
    if (user) {
      console.log('✅ Existing user found, logging in:', user.displayName);
      
      // Update last login time
      await usersCollection.updateOne(
        { _id: user._id },
        { 
          $set: { 
            lastLogin: new Date(),
            accessToken: accessToken // Update access token
          }
        }
      );
      
      return done(null, user);
    } else {
      console.log('🆕 New user, creating account for:', profile.displayName);
      
      // Create new user
      const newUser = {
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        email: profile.emails?.[0]?.value || null,
        profileUrl: profile.profileUrl,
        avatarUrl: profile.photos?.[0]?.value || null,
        accessToken: accessToken,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: 'user' // Default role
      };
      
      const result = await usersCollection.insertOne(newUser);
      newUser._id = result.insertedId;
      
      console.log('✅ New user created successfully:', newUser.displayName);
      return done(null, newUser);
    }
  } catch (error) {
    console.error('❌ Error in GitHub OAuth strategy:', error.message);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  console.log('📦 Serializing user for session:', user.displayName);
  done(null, user._id.toString());
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    console.log('📦 Deserializing user from session, ID:', id);

    const db = await getDB();
    
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (user) {
      console.log('✅ User deserialized successfully:', user.displayName);
    } else {
      console.log('❌ User not found during deserialization');
    }
    
    done(null, user);
  } catch (error) {
    console.error('❌ Error deserializing user:', error.message);
    done(error, null);
  }
});

export default passport;