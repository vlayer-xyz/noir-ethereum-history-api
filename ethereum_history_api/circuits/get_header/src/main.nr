use dep::ethereum_history_api::header::{get_header, BlockHeaderPartial};

fn main(block_no: pub Field) -> distinct pub BlockHeaderPartial {
    get_header(block_no)
}
