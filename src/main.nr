fn main() {
    f();
}

pub fn f<NUM_FIELDS>() -> [Field; NUM_FIELDS] {
    [0; NUM_FIELDS]
}
