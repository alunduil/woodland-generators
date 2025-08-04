import { root } from "../../../src/logging";
import fc from "fast-check";
import { TestPlaybookSource, mockPlaybooks } from "./types.common";

describe("PlaybookSource properties", () => {
  beforeEach(() => {
    root.level = "silent";
  });

  describe("getRandomPlaybook distribution properties", () => {
    it("should vary selection across different seeds when multiple playbooks exist", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uniqueArray(fc.string({ minLength: 1, maxLength: 20 }), {
            minLength: 10,
            maxLength: 20,
          }),
          async (seeds) => {
            const source = new TestPlaybookSource(mockPlaybooks);
            const playbooks = await Promise.all(
              seeds.map((seed) => source.getRandomPlaybook(seed)),
            );

            const archetypes = playbooks.map((p) => p.archetype);
            const uniqueArchetypes = new Set(archetypes);

            // With multiple playbooks and multiple seeds, we should see some variety
            return uniqueArchetypes.size > 1;
          },
        ),
      );
    });
  });
});
