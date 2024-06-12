use std::collections::HashMap;
use rocket::response::content::RawHtml;

#[macro_use]
extern crate rocket;

type Messages = HashMap<String, Vec<String>>;

#[get("/")]
fn index() -> RawHtml<&'static str> {
    RawHtml("<h1>Welcome to my Rocket server!</h1>")
}

#[launch]
fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![index])
}