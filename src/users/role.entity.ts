import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Role {
    @PrimaryGeneratedColumn({type: 'bigint'})
    id: number;

    @Column()
    name: string;
}