import { Injectable } from '@angular/core';
import { User } from '../model/user.model';
import { Tache } from '../model/tache.model';

@Injectable({ providedIn: 'root' })
export class TirageService {

  draw(users: User[], menagePool: Tache[]): User[] {
    if (!users.length || !menagePool.length) return users;

    const resetUsers = users.map<User>(u => ({
      ...u,
      menages: []
    }));

    const shuffledUsers = this.shuffle([...resetUsers]);
    const shuffledMenages = this.shuffle([...menagePool]);

    shuffledMenages.forEach((menage, index) => {
      const userIndex = index % shuffledUsers.length;
      shuffledUsers[userIndex].taches.push(menage);
    });

    return resetUsers;
  }

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
