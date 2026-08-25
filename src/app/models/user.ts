export class User{
    constructor(
        private _token: string,
        private _lang: number,
        private userName: string,
        private id: number,
        private empID: number,
        private errorMsg: string,
        private applicationID: number,
        private userLogId: number,
    ){
        
    }
    get token(){
        return this._token;
    }
}