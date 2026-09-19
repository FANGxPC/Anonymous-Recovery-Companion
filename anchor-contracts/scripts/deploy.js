import hre from "hardhat";

async function main() {
  console.log("Deploying ResourceRegistry...");

  const ResourceRegistry = await hre.ethers.getContractFactory("ResourceRegistry");
  const registry = await ResourceRegistry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("ResourceRegistry deployed to:", registryAddress);

  // Seed with initial trusted resources
  console.log("Seeding trusted resources...");
  
  const tx1 = await registry.verifyResource(
    "988-lifeline",
    "988 Suicide & Crisis Lifeline",
    "https://988lifeline.org"
  );
  await tx1.wait();
  console.log("✅ Verified: 988-lifeline");

  const tx2 = await registry.verifyResource(
    "samhsa-helpline",
    "SAMHSA National Helpline",
    "https://www.samhsa.gov/find-help/national-helpline"
  );
  await tx2.wait();
  console.log("✅ Verified: samhsa-helpline");
  
  // Example of a revoked resource for demo purposes
  const tx3 = await registry.verifyResource(
    "outdated-clinic",
    "Old Recovery Clinic",
    "http://example.com/old"
  );
  await tx3.wait();
  const tx4 = await registry.revokeResource("outdated-clinic");
  await tx4.wait();
  console.log("❌ Revoked: outdated-clinic");

  console.log("Done!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
