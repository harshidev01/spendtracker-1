"use server";

import connectDB from "@/app/mongodb/connectors/connectDB";
import userModel from "@/app/mongodb/models/userModel";
import { generateAuthToken } from "@/app/utils/auth/cookieHandlers";
import {
  ERROR,
  MISSING_EMAIL_ID,
  MISSING_FISRT_NAME,
  MISSING_PASSWORD,
  MONGO_DB_ERROR,
  SUCCESS,
  USER_EXISTS,
} from "@/app/utils/responses/errorResponses";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { emailId, firstName, lastName, phoneNumber, password } =
    await req.json();

  if (emailId && firstName && password) {
    const handler = NextResponse.next();

    try {
      await connectDB();
    } catch {
      return NextResponse.json(
        {
          message: MONGO_DB_ERROR,
        },
        {
          status: 500,
        }
      );
    }

    const user = await userModel.findOne({ emailId });

    if (user?.emailId) {
      return NextResponse.json(
        {
          message: USER_EXISTS,
        },
        {
          status: 200,
        }
      );
    }

    const authToken = generateAuthToken(200);
    handler.cookies.set("authToken", authToken);

    const userData = await userModel.create({
      emailId,
      firstName,
      lastName,
      loggedIn: false,
      phoneNumber,
      authToken,
    });

    if (userData?.emailId) {
      return NextResponse.json(
        {
          message: SUCCESS,
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        {
          message: ERROR,
        },
        {
          status: 400,
        }
      );
    }
  } else {
    return NextResponse.json({
      message: !emailId
        ? MISSING_EMAIL_ID
        : !password
        ? MISSING_PASSWORD
        : MISSING_FISRT_NAME,
    });
  }
}
