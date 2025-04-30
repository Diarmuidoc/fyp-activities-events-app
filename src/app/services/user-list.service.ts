import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, collection, collectionData, doc, setDoc, deleteDoc, DocumentReference, CollectionReference, docData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap, map, shareReplay } from 'rxjs/operators';


export interface SavedActivity {
  place_id: string; // Use as document ID in subcollection
  name: string;
  vicinity?: string;
  imageUrl?: string | null;
  addedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UserListService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  private userId$: Observable<string | null> = authState(this.auth).pipe(
    map(user => user ? user.uid : null),
    shareReplay(1)
  );

  getSavedActivities(): Observable<SavedActivity[]> {
    return this.userId$.pipe(
      switchMap(userId => {
        if (!userId) {
          return of([]);
        }
        const savedPlacesCollection = collection(this.firestore, `userSavedActivities/${userId}/savedPlaces`) as CollectionReference<SavedActivity>;
        return collectionData(savedPlacesCollection, { idField: 'place_id' });
      })
    );
  }


  async addActivity(place: SavedActivity): Promise<void> {
    const userId = this.auth.currentUser?.uid;
    if (!userId) {
      throw new Error('User must be logged in to save activities.');
    }
    if (!place || !place.place_id) {
      throw new Error('Invalid place data: place_id is required.');
    }

    const placeDocRef = doc(this.firestore, `userSavedActivities/${userId}/savedPlaces/${place.place_id}`) as DocumentReference<SavedActivity>;

    const dataToSave: Partial<SavedActivity> = {
      name: place.name,
      vicinity: place.vicinity,
      imageUrl: place.imageUrl,
      addedAt: new Date() // Add a timestamp
    };

    console.log(`Attempting to save activity ${place.place_id} for user ${userId}`);
    await setDoc(placeDocRef, dataToSave);
    console.log(`Activity ${place.place_id} saved successfully.`);
  }


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


  isActivitySaved(placeId: string): Observable<boolean> {
    return this.userId$.pipe(
      switchMap(userId => {
        if (!userId || !placeId) {
          return of(false);
        }
        const placeDocRef = doc(this.firestore, `userSavedActivities/${userId}/savedPlaces/${placeId}`);
        return docData(placeDocRef).pipe(
          map(docSnap => !!docSnap)
        );
      })
    );
  }

}
