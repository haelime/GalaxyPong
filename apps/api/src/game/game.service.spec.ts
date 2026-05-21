import { GameService } from "./game.service";

describe("GameService", () => {
  it("queues the first quick-match player", async () => {
    const prisma = {} as never;
    const service = new GameService(prisma);

    await expect(service.joinQuick("u1", "nova")).resolves.toBeNull();
  });
});
