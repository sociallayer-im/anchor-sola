1.

```
error: package `solana-program v1.18.1` cannot be built because it requires rustc 1.72.0 or newer, while the currently active rustc version is 1.68.0-dev
Either upgrade to rustc 1.72.0 or newer, or use
cargo update -p solana-program@1.18.1 --precise ver
where `ver` is the latest version of `solana-program` supporting rustc 1.68.0-dev
```

解决方案：

```
solana-install init <version>
```

2.

```
Error: Function _ZN112_$LT$solana_program..instruction..InstructionError$u20$as$u20$solana_frozen_abi..abi_example..AbiEnumVisitor$GT$13visit_for_abi17h7c908257107a3f8dE Stack offset of 4584 exceeded max offset of 4096 by 488 bytes, please minimize large stack variables
```

https://github.com/solana-labs/solana/pull/35038

栈内存不够，使用Box进行堆内存分配

解决方案：使用 Box Accounts： 

https://docs.rs/anchor-lang/latest/anchor_lang/accounts/boxed/index.html

```

#[derive(Accounts)]
pub struct Example {
    pub my_acc: Box<Account<'info, MyData>>
}
```

3.

```
Failed to get validator identity over RPC: HTTP status server error (502 Bad Gateway) for url (http://127.0.0.1:8899/)
Failed to get validator identity over RPC: HTTP status server error (502 Bad Gateway) for url (http://127.0.0.1:8899/)
Failed to get validator identity over RPC: HTTP status server error (502 Bad Gateway) for url (http://127.0.0.1:8899/)
Failed to get validator identity over RPC: HTTP status server error (502 Bad Gateway) for url (http://127.0.0.1:8899/)
```

把代理 vpn 模式调整为直接连接
