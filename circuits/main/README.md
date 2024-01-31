# Noir circuit

## Generating proofs

This circuit uses oracles and therefore you need to run the oracle server before generating proofs.
Oracle server is located in [packages/noir-ethereum-api](../packages/noir-ethereum-api) and can be run by:

```sh
yarn oracle-server
```

After that you can generate proofs by running nargo with `--oracle-resolver`` arg:

```sh
nargo prove --oracle-resolver http://localhost:5555
```

More details [here](https://noir-lang.org/docs/how_to/how-to-oracles/#step-3---usage-with-nargo)

## Known issues

### Private arguments

For now JS proover returns publicInputs including private arguments which causes an issue when we try to verify the proof using autogenerated contract. This should be investigated further but for now we just mark all arguments as public.