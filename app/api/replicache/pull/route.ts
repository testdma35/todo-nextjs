export const runtime = "nodejs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { tx } from "../../../../src/backend/pg";
import {
  getChangedEntries,
  getChangedLastMutationIDs,
  getClientGroup,
  getGlobalVersion,
} from "../../../../src/backend/data";
import { z } from "zod";
import type { PullResponse } from "replicache";

const pullRequestSchema = z.object({
  clientGroupID: z.string(),
  cookie: z.union([z.number(), z.null()]),
});

type PullRequest = z.infer<typeof pullRequestSchema>;

const authError = {};

export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  const userID = req.cookies.get("userID")?.value ?? "anon";

  console.log(`Processing pull`, JSON.stringify(requestBody, null, ""));
  const pullRequest = pullRequestSchema.parse(requestBody);

  let pullResponse: PullResponse;
  try {
    pullResponse = await processPull(pullRequest, userID);
  } catch (e) {
    if (e === authError) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    console.error("Error processing pull:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
  return NextResponse.json(pullResponse, { status: 200 });
}

async function processPull(req: PullRequest, userID: string) {
  const { clientGroupID, cookie: requestCookie } = req;

  const t0 = Date.now();

  const [entries, lastMutationIDChanges, responseCookie] = await tx(
    async (executor) => {
      const clientGroup = await getClientGroup(executor, req.clientGroupID);
      if (clientGroup && clientGroup.userID !== userID) {
        throw authError;
      }

      return Promise.all([
        getChangedEntries(executor, requestCookie ?? 0),
        getChangedLastMutationIDs(executor, clientGroupID, requestCookie ?? 0),
        getGlobalVersion(executor),
      ]);
    }
  );

  console.log("lastMutationIDChanges: ", lastMutationIDChanges);
  console.log("responseCookie: ", responseCookie);
  console.log("Read all objects in", Date.now() - t0);

  // TODO: Return ClientStateNotFound for Replicache 13 to handle case where
  // server state deleted.

  const res: PullResponse = {
    lastMutationIDChanges,
    cookie: responseCookie,
    patch: [],
  };

  for (const [key, value, deleted] of entries) {
    if (deleted) {
      res.patch.push({
        op: "del",
        key,
      });
    } else {
      res.patch.push({
        op: "put",
        key,
        value,
      });
    }
  }

  console.log(`Returning`, JSON.stringify(res, null, ""));
  return res;
}
