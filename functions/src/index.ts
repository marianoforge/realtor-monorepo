import { initializeApp } from "firebase-admin/app";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { defineSecret } from "firebase-functions/params";
import { Client as HubSpot } from "@hubspot/api-client";

initializeApp();

const HUBSPOT_TOKEN = defineSecret("HUBSPOT_TOKEN");

function mapToHubSpotProps(data: any) {
  return {
    email: data.email ?? "",
    firstname: data.firstName ?? "",
    lastname: data.lastName ?? "",
    phone: data.numeroTelefono ?? "",
    lifecyclestage: "subscriber",
  };
}

async function upsertContactByEmail(hs: HubSpot, props: Record<string, any>) {
  if (!props.email) return { action: "skipped-no-email" };

  const searchRes = await hs.crm.contacts.searchApi.doSearch({
    filterGroups: [
      {
        filters: [
          {
            propertyName: "email",
            operator: "EQ" as any,
            value: props.email,
          },
        ],
      },
    ],
    limit: 1,
    properties: ["email"],
  });

  const found = searchRes.results?.[0];

  if (found?.id) {
    await hs.crm.contacts.basicApi.update(found.id, { properties: props });
    return { id: found.id, action: "updated" };
  } else {
    const created = await hs.crm.contacts.basicApi.create({
      properties: props,
    });
    return { id: created.id, action: "created" };
  }
}

export const onUserCreatedSyncToHubSpot = onDocumentCreated(
  {
    document: "usuarios/{userId}",
    region: "europe-west3",
    secrets: [HUBSPOT_TOKEN],
    retry: true,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();

    if (!data?.email) {
      console.warn("No sync: doc sin email.");
      return;
    }

    const hs = new HubSpot({ accessToken: HUBSPOT_TOKEN.value() });
    const props = mapToHubSpotProps(data);

    try {
      const res = await upsertContactByEmail(hs, props);
      console.log(`HubSpot contact ${res?.action}`, res);
    } catch (err: any) {
      if (err?.statusCode === 429 || err?.statusCode >= 500) {
        console.error(
          "Error transitorio en HubSpot:",
          err?.statusCode,
          err?.message,
        );
        throw err;
      }
      console.error("Error definitivo en HubSpot:", err?.response?.body ?? err);
      throw err;
    }
  },
);
