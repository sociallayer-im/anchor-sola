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
