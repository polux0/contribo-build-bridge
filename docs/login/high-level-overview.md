flowchart TD
  A["Landing / Gigs"] --> B{"Logged in?"}
  B -- No --> C["Auth via Privy (LinkedIn / GitHub / Google)"]
  B -- Yes --> D
  C --> D["Ensure wallet (auto embedded or connect MetaMask)"]
  D --> E["Browse gigs"]
  E --> F["Click Apply"]
  F --> G{"Has GitHub and wallet?"}
  G -- No --> H["Finish setup: Link GitHub and/or connect wallet"]
  H --> G
  G -- Yes --> I["Open application form"]
  I --> J["Submit → Backend verifies session, github id, wallet"]
  J --> K["Confirmation"]
