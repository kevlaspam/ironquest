import { doc, setDoc, getDoc, updateDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function initializeUserData(userId: string) {
  const userProfileRef = doc(db, 'userProfiles', userId);
  const userAchievementsRef = doc(db, 'userAchievements', userId);

  const userProfileDoc = await getDoc(userProfileRef);
  const userAchievementsDoc = await getDoc(userAchievementsRef);

  if (!userProfileDoc.exists()) {
    await setDoc(userProfileRef, {
      level: 1,
      workoutStreak: 0,
      lastWorkoutDate: null
    });
  } else {
    // Ensure workoutStreak exists and is a number
    const profileData = userProfileDoc.data();
    if (typeof profileData.workoutStreak !== 'number') {
      await updateDoc(userProfileRef, {
        workoutStreak: 0
      });
    }
  }

  if (!userAchievementsDoc.exists()) {
    await setDoc(userAchievementsRef, {
      achievements: []
    });
  }
}

export async function updateWorkoutStreak(userId: string) {
  const userProfileRef = doc(db, 'userProfiles', userId);
  const now = Timestamp.now();

  const userProfileDoc = await getDoc(userProfileRef);
  if (userProfileDoc.exists()) {
    const profileData = userProfileDoc.data();
    if (typeof profileData.workoutStreak !== 'number') {
      await updateDoc(userProfileRef, {
        workoutStreak: 1,
        lastWorkoutDate: now
      });
    } else {
      await updateDoc(userProfileRef, {
        workoutStreak: increment(1),
        lastWorkoutDate: now
      });
    }
  }
}

export async function addAchievement(userId: string, achievement: { id: string, name: string, description: string, achieved: boolean }) {
  const userAchievementsRef = doc(db, 'userAchievements', userId);
  await updateDoc(userAchievementsRef, {
    achievements: arrayUnion(achievement)
  });
}