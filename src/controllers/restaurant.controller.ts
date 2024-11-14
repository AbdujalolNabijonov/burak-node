import Member from "../models/Member.model";
import { T } from "../libs/types/common";
import { Request, Response } from "express"
import { MemberType } from "../libs/enums/member.enum";

const restaurantController: T = {}

restaurantController.goHome = async (req: Request, res: Response) => {
    try {
        console.log("goHome")
        res.send("Home Page")
    } catch (err: any) {
        console.log("Error: goHome", err)
        res.send(err)
    }
}
restaurantController.getLogin = async (req: Request, res: Response) => {
    try {
        console.log("")
        res.send("Log In")
    } catch (err: any) {
        console.log("Error: goHome", err)
    }
}
restaurantController.getSignup = async (req: Request, res: Response) => {
    try {
        res.send("Sign Up")
    } catch (err: any) {
        console.log("Error: goHome", err)
    }
}
restaurantController.processLogin = async (req: Request, res: Response) => {
    try {
        res.send("processLogin")
    } catch (err: any) {
        console.log("Error: goHome", err)
    }
}
restaurantController.processSignup = async (req: Request, res: Response) => {
    try {
        console.log("processSignup");
        const data = req.body;
        data.memberType = MemberType.RESTAURANT;

        const memberService = new Member();
        const result = await memberService.processSignup(data);
        res.send(result)
    } catch (err: any) {
        console.log("Error: processSignup", err)
        res.send(err)
    }
}

export default restaurantController