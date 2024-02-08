export type AnchorSola = {
  "version": "0.1.0",
  "name": "anchor_sola",
  "instructions": [
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
      "name": "CannotReviewOwned",
      "msg": "You cannot create a review for an SOLA that you currently own or published"
    },
    {
      "code": 6001,
      "name": "CuratorAlreadySet",
      "msg": "There is already a verified curator assigned"
    },
    {
      "code": 6002,
      "name": "CuratorAuthorityMismatch",
      "msg": "The expected curator authority did not match expected"
    },
    {
      "code": 6003,
      "name": "CuratorMismatch",
      "msg": "The provided curator account did not match the one assigned"
    },
    {
      "code": 6004,
      "name": "MetadataIsImmutable",
      "msg": "The metadata of the SOLA is marked as immutable"
    },
    {
      "code": 6005,
      "name": "RatingOutOfBounds",
      "msg": "The rating for a review must be between 0 and 5"
    },
    {
      "code": 6006,
      "name": "SupplyReduction",
      "msg": "Updated supply is less than the original supply set on creation"
    },
    {
      "code": 6007,
      "name": "SuspendedInstallation",
      "msg": "Attempting to install a currently suspended SOLA"
    },
    {
      "code": 6008,
      "name": "UnauthorizedInstall",
      "msg": "The access account provided is not associated with the wallet"
    },
    {
      "code": 6009,
      "name": "UnknownCreator",
      "msg": "A provided creator was not found on the metadata account"
    },
    {
      "code": 6010,
      "name": "UpdateAuthorityMismatch",
      "msg": "The signer did not match the update authority of the metadata account or the owner"
    },
    {
      "code": 6011,
      "name": "UpdateReviewAuthorityMismatch",
      "msg": "The signing authority for the SOLA update did not match the review authority"
    },
    {
      "code": 6012,
      "name": "UriExceedsMaxLength",
      "msg": "The metadata URI provided exceeds the maximum length"
    },
    {
      "code": 6013,
      "name": "SOLANotDeletable",
      "msg": "The SOLA is not deletable because its either an app with installations or has reviews"
    },
    {
      "code": 6014,
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
      "name": "CannotReviewOwned",
      "msg": "You cannot create a review for an SOLA that you currently own or published"
    },
    {
      "code": 6001,
      "name": "CuratorAlreadySet",
      "msg": "There is already a verified curator assigned"
    },
    {
      "code": 6002,
      "name": "CuratorAuthorityMismatch",
      "msg": "The expected curator authority did not match expected"
    },
    {
      "code": 6003,
      "name": "CuratorMismatch",
      "msg": "The provided curator account did not match the one assigned"
    },
    {
      "code": 6004,
      "name": "MetadataIsImmutable",
      "msg": "The metadata of the SOLA is marked as immutable"
    },
    {
      "code": 6005,
      "name": "RatingOutOfBounds",
      "msg": "The rating for a review must be between 0 and 5"
    },
    {
      "code": 6006,
      "name": "SupplyReduction",
      "msg": "Updated supply is less than the original supply set on creation"
    },
    {
      "code": 6007,
      "name": "SuspendedInstallation",
      "msg": "Attempting to install a currently suspended SOLA"
    },
    {
      "code": 6008,
      "name": "UnauthorizedInstall",
      "msg": "The access account provided is not associated with the wallet"
    },
    {
      "code": 6009,
      "name": "UnknownCreator",
      "msg": "A provided creator was not found on the metadata account"
    },
    {
      "code": 6010,
      "name": "UpdateAuthorityMismatch",
      "msg": "The signer did not match the update authority of the metadata account or the owner"
    },
    {
      "code": 6011,
      "name": "UpdateReviewAuthorityMismatch",
      "msg": "The signing authority for the SOLA update did not match the review authority"
    },
    {
      "code": 6012,
      "name": "UriExceedsMaxLength",
      "msg": "The metadata URI provided exceeds the maximum length"
    },
    {
      "code": 6013,
      "name": "SOLANotDeletable",
      "msg": "The SOLA is not deletable because its either an app with installations or has reviews"
    },
    {
      "code": 6014,
      "name": "UnBurnable",
      "msg": "The SOLA is UnBurnable."
    }
  ]
};
