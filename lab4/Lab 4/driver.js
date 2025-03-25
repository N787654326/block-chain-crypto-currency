"use strict";

let blindSignatures = require("blind-signatures");
let SpyAgency = require("./spyAgency.js").SpyAgency;

function makeDocument(coverName) {
  return `The bearer of this signed document, ${coverName}, has full diplomatic immunity.`;
}

let agency = new SpyAgency();
let coverNames = [
  "Agent X",
  "John Doe",
  "Jane Smith",
  "James Bond",
  "Ethan Hunt",
  "Natasha Romanoff",
  "Jason Bourne",
  "Lara Croft",
  "Michael Westen",
  "Sydney Bristow",
];

let documents = coverNames.map(makeDocument);
let blindDocs = [];
let blindingFactors = [];

// Blind each document
for (let doc of documents) {
  let { blinded, r } = blindSignatures.blind({
    message: doc,
    N: agency.n,
    E: agency.e,
  });
  blindDocs.push(blinded);
  blindingFactors.push(r);
}

console.log("Generated Documents:", documents);
console.log("Blinded Messages:", blindDocs);
console.log("Blinding Factors:", blindingFactors);

agency.signDocument(blindDocs, (selected, verifyAndSign) => {
  let verifiedBlindingFactors = blindingFactors.map((r, i) => (i === selected ? undefined : r));
  let verifiedDocuments = documents.map((doc, i) => (i === selected ? undefined : doc));

  let signedBlinded = verifyAndSign(verifiedBlindingFactors, verifiedDocuments);

  let signedDocument = blindSignatures.unblind({
    signed: signedBlinded,
    N: agency.n,
    r: blindingFactors[selected],
  });

  console.log(`Signed document for '${coverNames[selected]}':`, signedDocument);

  let isValid = blindSignatures.verify({
    unblinded: signedDocument,
    N: agency.n,
    E: agency.e,
    message: documents[selected],
  });

  console.log("Signature valid?", isValid);
});