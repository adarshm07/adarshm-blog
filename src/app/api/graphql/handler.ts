// // implements - return type
// class Base implements Base {
//     public get User(): User {
//         return new User(this)
//     }

//     // public set
// }

// export class User {
//     // new instance of Base
//     base: Base;
//     private _name: string;
//     constructor(base: Base) {
//         this.base = base;
//     }

//     async getUser(): Promise<Boolean> {
//         try {
//             return true
//         } catch (error) {
//             return false
//         }
//     }

//     async updateUser(): Promise<Boolean> {
//         try {
//             return true;
//         } catch (error) {
//             return false;
//         }
//     }

// }


// let base = new Base()
// let getUser = base.User.getUser