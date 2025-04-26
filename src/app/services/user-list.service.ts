import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, DocumentReference, CollectionReference, docData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, map, shareReplay } from 'rxjs/operators';

// Interface for the data we save (optional but good practice)
export interface SavedActivity {
  place_id: string; // Use as document ID in subcollection
  name: string;
  vicinity?: string;
  imageUrl?: string | null;
  addedAt?: Date; // Optional: Timestamp when added
}

@Injectable({
  providedIn: 'root'
})
export class UserListService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  // Observable of the current user's UID
  private userId$: Observable<string | null> = authState(this.auth).pipe(
    map(user => user ? user.uid : null),
    shareReplay(1) // Share the observable result to avoid multiple authState calls
  );

  /**
   * Gets an observable list of saved activities for the current user.
   * Returns an empty array observable if the user is not logged in.
   */
  getSavedActivities(): Observable<SavedActivity[]> {
    return this.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return of([]); // No user logged in, return empty array observable
        }
        // Construct path: userSavedActivities/{userId}/savedPlaces
        const savedPlacesCollection = collection(this.firestore, `userSavedActivities/${userId}/savedPlaces`) as CollectionReference<SavedActivity>;
        // Use collectionData, specifying the idField to include the document ID (place_id)
        return collectionData(savedPlacesCollection, { idField: 'place_id' });
      })
    );
  }

  /**
   * Adds an activity to the current user's saved list.
   * Uses place_id as the document ID in the subcollection to prevent duplicates.
   * @param place The activity data to save (must include place_id)
   */
  async addActivity(place: SavedActivity): Promise<void> {
    const userId = this.auth.currentUser?.uid; // Get current user ID synchronously
    if (!userId) {
      throw new Error('User must be logged in to save activities.');
    }
    if (!place || !place.place_id) {
      throw new Error('Invalid place data: place_id is required.');
    }

    // Reference to the specific document using place_id as the ID
    // userSavedActivities/{userId}/savedPlaces/{placeId}
    const placeDocRef = doc(this.firestore, `userSavedActivities/${userId}/savedPlaces/${place.place_id}`) as DocumentReference<SavedActivity>;

    // Data to save (you can filter/select fields here if needed)
    const dataToSave: Partial<SavedActivity> = {
      name: place.name,
      vicinity: place.vicinity,
      imageUrl: place.imageUrl,
      addedAt: new Date() // Add a timestamp
      // place_id is used as the doc ID, so no need to store it inside the doc itself unless desired
    };

    console.log(`Attempting to save activity ${place.place_id} for user ${userId}`);
    // Use setDoc to create or overwrite the document with the given ID
    await setDoc(placeDocRef, dataToSave);
    console.log(`Activity ${place.place_id} saved successfully.`);
  }

  /**
   * Removes an activity from the current user's saved list.
   * @param placeId The place_id of the activity to remove.
   */
  async removeActivity(placeId: string): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to remove activities.');
    }
    if (!placeId) {
      throw new Error('Place ID is required to remove an activity.');
    }

    const placeDocRef = doc(this.firestore, `userSavedActivities/${userId}/savedPlaces/${placeId}`);
    console.log(`Attempting to remove activity ${placeId} for user ${userId}`);
    await deleteDoc(placeDocRef);
    console.log(`Activity ${placeId} removed successfully.`);
  }

  // Optional: Check if an activity is already saved
  isActivitySaved(placeId: string): Observable<boolean> {
    return this.userId$.pipe(
      switchMap(userId => {
        if (!userId || !placeId) {
          return of(false);
        }
        const placeDocRef = doc(this.firestore, `userSavedActivities/${userId}/savedPlaces/${placeId}`);
        return docData(placeDocRef).pipe(
          map(docSnap => !!docSnap) // Returns true if document exists, false otherwise
        );
      })
    );
  }

}
