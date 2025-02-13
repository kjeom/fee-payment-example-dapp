import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userSignedTx = await req.json();
    const result = await fetch(
      "https://fee-delegation.kaia.io/api/signAsFeePayer",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userSignedTx),
      }
    )
      .then((response) => response.json())
      .then((data) => {
        return data;
      });

    console.log(result);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
