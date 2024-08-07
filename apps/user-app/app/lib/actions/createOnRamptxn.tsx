"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import * as crypto from "node:crypto";
import axios from "axios";


export async function createOnRampTransaction(amount: number ,provider : string ){
    const session = await getServerSession(authOptions);
    const userId = session.user.id
    const token = crypto.randomBytes(20).toString('hex');

    if (!userId){
        return {
            message:"User not found"
        }
    }
    await prisma.onRampTransaction.create({
        data:{
            userId : Number(userId),
            amount: amount,
            provider: provider,
            status : "Processing",
            startTime: new Date(),
            token: token

        }
    })

    await axios.post(
        "http://localhost:3003/hdfcWebhook",{
            token: token,
            user_identifier: userId,
            amount: amount
        })

    return {
        message : "Done"
    }
    

} 