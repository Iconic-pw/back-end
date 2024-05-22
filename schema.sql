CREATE TABLE card (
    id SERIAL PRIMARY KEY,
    card_name VARCHAR(255),
    card_category VARCHAR(255),
    card_level VARCHAR(255),
    job_title VARCHAR(255),
    img VARCHAR(255) ,
    portfolio VARCHAR(255),
    is_fav BOOLEAN DEFAULT TRUE 
);


CREATE TABLE about_us (
    id SERIAL PRIMARY KEY,
    my_name VARCHAR(255),
    img VARCHAR(255) ,
    describtion VARCHAR(255),
    portfolio VARCHAR(255)
);
