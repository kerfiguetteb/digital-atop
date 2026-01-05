import { Tache } from "./tache.model";

export interface User {
    id:number;
    nom:string;
    imgUrl:string
    taches:Tache[]
}