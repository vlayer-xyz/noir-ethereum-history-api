nargo compile --package get_header
nargo compile --package get_account
nargo compile --package get_storage

nargo info --package get_header
nargo info --package get_account
nargo info --package get_storage

nargo execute --package get_header --oracle-resolver=http://localhost:5555
nargo execute --package get_account --oracle-resolver=http://localhost:5555
nargo execute --package get_storage --oracle-resolver=http://localhost:5555

nargo prove --package get_header --oracle-resolver=http://localhost:5555
nargo prove --package get_account --oracle-resolver=http://localhost:5555
nargo prove --package get_storage --oracle-resolver=http://localhost:5555

# nargo verify --package get_header
# nargo verify --package get_account
# nargo verify --package get_storage

nargo codegen-verifier --package get_header
nargo codegen-verifier --package get_account
nargo codegen-verifier --package get_storage

(cd ethereum_history_api/contracts && forge build)