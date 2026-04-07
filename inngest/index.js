import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";
import { $Enums, Status } from "@prisma/client";


export const inngest = new Inngest({ id: "profile-marketplace" });

const SyncUserCreation = inngest.createFunction(
  { id: "syc-user-from-clerk", triggers: [{ event: "clerk/user.created" }] },
  async ({ event }) => {
    const {data}=event

    const user= await prisma.user.findFirst({
        Where:{id:data.id}
    })

    if(user){
        await prisma.user.update({
            where:{id:data.id},
            data:{
                email: data?.email_addresses[0]?.email_address,
                name:data?.first_name+" "+data?.last_name,
                image:data?.image_url,

            }
        })
        return;
    }
    await prisma.user.create({
        data:{
            id:data.id,
            email: data?.email_addresses[0]?.email_addresses,
            name:data?.findFirst+" "+data?.last_name,
            image:data?.image_url,
        }
    })
  },
);

//Supprission
const SyncUserDeletion = inngest.createFunction(
  { 
    id: "delete-user-from-clerk",
    triggers: [{ event: "clerk/user.deleted" }] 
  },
  async ({ event }) => {
    const { data } = event;

    const listings = await prisma.listings.findMany({
      where: { ownerId: data.id }
    });

    const chats = await prisma.chats.findMany({
      where: { 
        OR: [
          { ownerUserId: data.id },
          { chatUserId: data.id }
        ] 
      }
    });

    const transactions = await prisma.transactions.findMany({
      where: { ownerId: data.id }
    });

    if (
      listings.length === 0 &&
      chats.length === 0 &&
      transactions.length === 0
    ) {
      await prisma.user.delete({
        where: { id: data.id }
      });
    } else {
      await prisma.user.update({
        where: { id: data.id },
        data: { status: "inactive" }
      });
    }
  }
);

// Modification 
const SyncUserUpdation = inngest.createFunction(
  { 
    id: "update-user-from-clerk",
    triggers: [{ event: "clerk/user.updated" }] 
  },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
        where:{id:data.id},
        data:{
            id:data.id,
            email: data?.email_addresses[0]?.email_addresses,
            name:data?.findFirst+" "+data?.last_name,
            image:data?.image_url,
        }
    })

  }
);


export const functions = [
    SyncUserCreation,
    SyncUserDeletion,
    SyncUserUpdation
];