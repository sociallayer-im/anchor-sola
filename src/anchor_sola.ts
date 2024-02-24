export type AnchorSola = {
  "version": "0.1.0",
  "name": "anchor_sola",
  "instructions": [
    {
      "name": "initializee",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "chainid",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "mintProfile",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "addressDefaultProfiles",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileId",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "params",
          "type": {
            "defined": "MintProfileParams"
          }
        }
      ],
      "returns": "u64"
    },
    {
      "name": "burnProfile",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "addressDefaultProfiles",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "close",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setProfileCreator",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solaCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateProfileGlobal",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "chainid",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "create",
      "accounts": [
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sola",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "decimals",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "CreateSolaParams"
          }
        }
      ]
    },
    {
      "name": "burn",
      "accounts": [
        {
          "name": "sola",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account and the token account mint check."
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "delete",
      "accounts": [
        {
          "name": "sola",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account and the token account mint check."
          ]
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "mint",
      "accounts": [
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sola",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transfer",
      "accounts": [
        {
          "name": "sola",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "solaProfileGlobal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "counter",
            "type": "u64"
          },
          {
            "name": "classCounter",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "chainid",
            "type": "u64"
          },
          {
            "name": "baseUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "isProfileCreator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isProfileCreator",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "defaultProfileId",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "solaProfile",
      "docs": [
        "和spl的Mint关联",
        "",
        "seeds: \"sola_profile\" + master_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileId",
            "docs": [
              "初始计数器，后续作为token id来使用"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "masterMint",
            "docs": [
              "初始化的mint地址"
            ],
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "docs": [
              "初始化的metadata地址"
            ],
            "type": "publicKey"
          },
          {
            "name": "masterEdition",
            "type": "publicKey"
          },
          {
            "name": "addressDefaultProfiles",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "profileBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "mintBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    },
    {
      "name": "solaProperty",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "publisher",
            "docs": [
              "The pubkey of the original SOLA creator (32)."
            ],
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "docs": [
              "The pubkey of the MPL master metadata account (32)."
            ],
            "type": "publicKey"
          },
          {
            "name": "masterMint",
            "docs": [
              "The pubkey of the master token mint (32)."
            ],
            "type": "publicKey"
          },
          {
            "name": "isBurnable",
            "type": "bool"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "docs": [
              "The bump nonce for the SOLA's PDA (1)."
            ],
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MintProfileParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "CreatorsParam"
              }
            }
          },
          {
            "name": "curator",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "isMutable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CreatorsParam",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "share",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "CreateSolaParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "CreatorsParam"
              }
            }
          },
          {
            "name": "curator",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "isBurnable",
            "type": "bool"
          },
          {
            "name": "isMutable",
            "type": "bool"
          },
          {
            "name": "updateAuthorityIsSigner",
            "type": "bool"
          },
          {
            "name": "updatePrimarySaleHappenedViaToken",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ProfileIdNotNull",
      "msg": "When mint default profiles, profile id must be null."
    },
    {
      "code": 6001,
      "name": "NotFoundDefaultProfiles",
      "msg": "Not found default profiles in accounts."
    },
    {
      "code": 6002,
      "name": "FoundDefaultProfiles",
      "msg": "Found default profiles in accounts."
    },
    {
      "code": 6003,
      "name": "CannotReviewOwned",
      "msg": "You cannot create a review for an SOLA that you currently own or published"
    },
    {
      "code": 6004,
      "name": "CuratorAlreadySet",
      "msg": "There is already a verified curator assigned"
    },
    {
      "code": 6005,
      "name": "CuratorAuthorityMismatch",
      "msg": "The expected curator authority did not match expected"
    },
    {
      "code": 6006,
      "name": "CuratorMismatch",
      "msg": "The provided curator account did not match the one assigned"
    },
    {
      "code": 6007,
      "name": "CuratorNotFound",
      "msg": "The provided metadata not found curators."
    },
    {
      "code": 6008,
      "name": "CuratorsIsSoMuch",
      "msg": "The profile curators is so much!"
    },
    {
      "code": 6009,
      "name": "NotProfileCreator",
      "msg": "The publisher is not the profile creator."
    },
    {
      "code": 6010,
      "name": "MetadataIsImmutable",
      "msg": "The metadata of the SOLA is marked as immutable"
    },
    {
      "code": 6011,
      "name": "RatingOutOfBounds",
      "msg": "The rating for a review must be between 0 and 5"
    },
    {
      "code": 6012,
      "name": "SupplyReduction",
      "msg": "Updated supply is less than the original supply set on creation"
    },
    {
      "code": 6013,
      "name": "SuspendedInstallation",
      "msg": "Attempting to install a currently suspended SOLA"
    },
    {
      "code": 6014,
      "name": "UnauthorizedInstall",
      "msg": "The access account provided is not associated with the wallet"
    },
    {
      "code": 6015,
      "name": "UnknownCreator",
      "msg": "A provided creator was not found on the metadata account"
    },
    {
      "code": 6016,
      "name": "UpdateAuthorityMismatch",
      "msg": "The signer did not match the update authority of the metadata account or the owner"
    },
    {
      "code": 6017,
      "name": "UpdateReviewAuthorityMismatch",
      "msg": "The signing authority for the SOLA update did not match the review authority"
    },
    {
      "code": 6018,
      "name": "UriExceedsMaxLength",
      "msg": "The metadata URI provided exceeds the maximum length"
    },
    {
      "code": 6019,
      "name": "SOLANotDeletable",
      "msg": "The SOLA is not deletable because its either an app with installations or has reviews"
    },
    {
      "code": 6020,
      "name": "UnBurnable",
      "msg": "The SOLA is UnBurnable."
    }
  ]
};

export const IDL: AnchorSola = {
  "version": "0.1.0",
  "name": "anchor_sola",
  "instructions": [
    {
      "name": "initializee",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "chainid",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "mintProfile",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaCreator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "addressDefaultProfiles",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "to",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileId",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "params",
          "type": {
            "defined": "MintProfileParams"
          }
        }
      ],
      "returns": "u64"
    },
    {
      "name": "burnProfile",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "addressDefaultProfiles",
          "isMut": true,
          "isSigner": false,
          "isOptional": true
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterEdition",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenRecord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "solaProfile",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "close",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "splAtaProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sysvarInstructions",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "profileId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setProfileCreator",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "solaCreator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "creator",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "status",
          "type": "bool"
        }
      ]
    },
    {
      "name": "updateProfileGlobal",
      "accounts": [
        {
          "name": "solaProfileGlobal",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "chainid",
          "type": "u64"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "create",
      "accounts": [
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sola",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "metadataProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "decimals",
          "type": "u8"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "params",
          "type": {
            "defined": "CreateSolaParams"
          }
        }
      ]
    },
    {
      "name": "burn",
      "accounts": [
        {
          "name": "sola",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account and the token account mint check."
          ]
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "delete",
      "accounts": [
        {
          "name": "sola",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMetadata",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false,
          "docs": [
            "account and the token account mint check."
          ]
        },
        {
          "name": "receiver",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "mint",
      "accounts": [
        {
          "name": "masterMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterToken",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sola",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "publisher",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "transfer",
      "accounts": [
        {
          "name": "sola",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "source",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "destination",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "masterMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "recipient",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "solaProfileGlobal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "counter",
            "type": "u64"
          },
          {
            "name": "classCounter",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "chainid",
            "type": "u64"
          },
          {
            "name": "baseUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "isProfileCreator",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isProfileCreator",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "defaultProfileId",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "solaProfile",
      "docs": [
        "和spl的Mint关联",
        "",
        "seeds: \"sola_profile\" + master_mint"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "profileId",
            "docs": [
              "初始计数器，后续作为token id来使用"
            ],
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "masterMint",
            "docs": [
              "初始化的mint地址"
            ],
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "docs": [
              "初始化的metadata地址"
            ],
            "type": "publicKey"
          },
          {
            "name": "masterEdition",
            "type": "publicKey"
          },
          {
            "name": "addressDefaultProfiles",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "profileBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "mintBump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    },
    {
      "name": "solaProperty",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "publisher",
            "docs": [
              "The pubkey of the original SOLA creator (32)."
            ],
            "type": "publicKey"
          },
          {
            "name": "masterMetadata",
            "docs": [
              "The pubkey of the MPL master metadata account (32)."
            ],
            "type": "publicKey"
          },
          {
            "name": "masterMint",
            "docs": [
              "The pubkey of the master token mint (32)."
            ],
            "type": "publicKey"
          },
          {
            "name": "isBurnable",
            "type": "bool"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "docs": [
              "The bump nonce for the SOLA's PDA (1)."
            ],
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "MintProfileParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "CreatorsParam"
              }
            }
          },
          {
            "name": "curator",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "isMutable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "CreatorsParam",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "publicKey"
          },
          {
            "name": "share",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "CreateSolaParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creators",
            "type": {
              "vec": {
                "defined": "CreatorsParam"
              }
            }
          },
          {
            "name": "curator",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "sellerFeeBasisPoints",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "isBurnable",
            "type": "bool"
          },
          {
            "name": "isMutable",
            "type": "bool"
          },
          {
            "name": "updateAuthorityIsSigner",
            "type": "bool"
          },
          {
            "name": "updatePrimarySaleHappenedViaToken",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ProfileIdNotNull",
      "msg": "When mint default profiles, profile id must be null."
    },
    {
      "code": 6001,
      "name": "NotFoundDefaultProfiles",
      "msg": "Not found default profiles in accounts."
    },
    {
      "code": 6002,
      "name": "FoundDefaultProfiles",
      "msg": "Found default profiles in accounts."
    },
    {
      "code": 6003,
      "name": "CannotReviewOwned",
      "msg": "You cannot create a review for an SOLA that you currently own or published"
    },
    {
      "code": 6004,
      "name": "CuratorAlreadySet",
      "msg": "There is already a verified curator assigned"
    },
    {
      "code": 6005,
      "name": "CuratorAuthorityMismatch",
      "msg": "The expected curator authority did not match expected"
    },
    {
      "code": 6006,
      "name": "CuratorMismatch",
      "msg": "The provided curator account did not match the one assigned"
    },
    {
      "code": 6007,
      "name": "CuratorNotFound",
      "msg": "The provided metadata not found curators."
    },
    {
      "code": 6008,
      "name": "CuratorsIsSoMuch",
      "msg": "The profile curators is so much!"
    },
    {
      "code": 6009,
      "name": "NotProfileCreator",
      "msg": "The publisher is not the profile creator."
    },
    {
      "code": 6010,
      "name": "MetadataIsImmutable",
      "msg": "The metadata of the SOLA is marked as immutable"
    },
    {
      "code": 6011,
      "name": "RatingOutOfBounds",
      "msg": "The rating for a review must be between 0 and 5"
    },
    {
      "code": 6012,
      "name": "SupplyReduction",
      "msg": "Updated supply is less than the original supply set on creation"
    },
    {
      "code": 6013,
      "name": "SuspendedInstallation",
      "msg": "Attempting to install a currently suspended SOLA"
    },
    {
      "code": 6014,
      "name": "UnauthorizedInstall",
      "msg": "The access account provided is not associated with the wallet"
    },
    {
      "code": 6015,
      "name": "UnknownCreator",
      "msg": "A provided creator was not found on the metadata account"
    },
    {
      "code": 6016,
      "name": "UpdateAuthorityMismatch",
      "msg": "The signer did not match the update authority of the metadata account or the owner"
    },
    {
      "code": 6017,
      "name": "UpdateReviewAuthorityMismatch",
      "msg": "The signing authority for the SOLA update did not match the review authority"
    },
    {
      "code": 6018,
      "name": "UriExceedsMaxLength",
      "msg": "The metadata URI provided exceeds the maximum length"
    },
    {
      "code": 6019,
      "name": "SOLANotDeletable",
      "msg": "The SOLA is not deletable because its either an app with installations or has reviews"
    },
    {
      "code": 6020,
      "name": "UnBurnable",
      "msg": "The SOLA is UnBurnable."
    }
  ]
};
