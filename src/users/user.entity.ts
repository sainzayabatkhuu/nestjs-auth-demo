import {Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn} from "typeorm";
import {Role} from "./role.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn({type: 'bigint'})
    id: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column()
    activationKey: string;

    @Column()
    isActive: boolean;

    @ManyToMany(() => Role)
    @JoinTable({
        name: "user_role",
        joinColumn: {
            name: "user_id",
            referencedColumnName: "id"
        },
        inverseJoinColumn: {
            name: "role_id",
            referencedColumnName: "id"
        }
    })
    roles: Role[];
}