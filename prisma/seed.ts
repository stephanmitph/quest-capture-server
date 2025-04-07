import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Delete existing data
  await prisma.video.deleteMany({})
  await prisma.collection.deleteMany({})

  // Create sport collection
  const sportCollection = await prisma.collection.create({
    data: {
      id: "sport",
      name: "Sport",
      description: "Collection of various sports activites",
      promptText: "Sports activities",
      duration: "30",
      videos: {
        create: [
          { id: "1", date: "12-03-2025", time: "10:15", duration: "28s" },
          { id: "2", date: "12-03-2025", time: "11:38", duration: "24s" },
          { id: "3", date: "12-03-2025", time: "11:38", duration: "24s" },
          { id: "4", date: "12-03-2025", time: "10:15", duration: "28s" },
          { id: "5", date: "12-03-2025", time: "11:38", duration: "24s" },
        ],
      },
    },
  })

  // Create reading collection
  const readingCollection = await prisma.collection.create({
    data: {
      id: "reading",
      name: "Reading",
      description: "Collection of reading activites",
      promptText: "Reading activities",
      duration: "30",
      videos: {
        create: [
          { id: "1", date: "12-03-2025", time: "10:15", duration: "28s" },
          { id: "2", date: "12-03-2025", time: "11:38", duration: "24s" },
          { id: "3", date: "12-03-2025", time: "11:38", duration: "24s" },
        ],
      },
    },
  })

  console.log({ sportCollection, readingCollection })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

