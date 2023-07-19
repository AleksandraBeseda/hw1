import request from "supertest";
import { AvailableResolutions, app } from "../src/app";
import { HTTP_STATUSES } from "../src/utils";

describe("/videos", () => {

    beforeAll(async() => {
        await request(app).delete('/__test__/data');
     });

     it("should return empty array", async () => {
        await request(app)
        .get("/videos")
        .expect(HTTP_STATUSES.OK_200)
        .then((response) =>
          expect(response.body).toStrictEqual([]) 
                )
     });

     it("should return 404 for not existing video", async() => {
      await request(app)
        .get("/videos/234")
        .expect(HTTP_STATUSES.NOT_FOUND_404)          
    });
    
    it("shouldn't create new video because or wrong title", async() => {
      await request(app)
        .post("/videos")
        .send({title: "", author: "Anna", availableResolutions:  [AvailableResolutions.P1080]})
        .expect(HTTP_STATUSES.BAD_REQUEST_400, {
          "errorMessages": [
              {
                  "messsage": "Invalid title",
                  "field": "title"
              }
          ]
      })          
    }); 

    it("shouldn't create new video because or wrong author", async() => {
      await request(app)
        .post("/videos")
        .send({title: "Tomas first words", author: "", availableResolutions:  [AvailableResolutions.P1080]})
        .expect(HTTP_STATUSES.BAD_REQUEST_400, {
          "errorMessages": [
              {
                  "messsage": "Invalid author",
                  "field": "author"
              }
          ]
      })          
    });

    it("shouldn't create new video because or wrong availableResolutions", async() => {
      await request(app)
        .post("/videos")
        .send({title: "Tomas first words", author: "Here", availableResolutions: [22]})
        .expect(HTTP_STATUSES.BAD_REQUEST_400, {
          "errorMessages": [
              {
                  "messsage": "Invalid availableResolutions",
                  "field": "availableResolutions"
              }
          ]
      })          
    });

    let createdVideo1: any = null;
    it("should create new video1", async() => {
      const response = await request(app)
        .post("/videos")
        .send({title: "Sashullliaa", author: "Here", availableResolutions: [AvailableResolutions.P144]})
        .expect(HTTP_STATUSES.CREATED_201);
        
        createdVideo1 = response.body;
    });

    let createdVideo2: any = null;
    it("should create new video2", async() => {
      const response = await request(app)
        .post("/videos")
        .send({title: "Clarity Team forever", author: "Potraha", availableResolutions: [AvailableResolutions.P144, AvailableResolutions.P2160]})
        .expect(HTTP_STATUSES.CREATED_201);
        
        createdVideo2 = response.body; 
    });


    it(`shouldn't update video1 because of empty title`, async() => {

/*       await request(app)
        .put(`/users/` + createdVideo1.id)
        .send({title: "", author: "Veronika Bluuuuzz"})
        .expect(HTTP_STATUSES.BAD_REQUEST_400); */
      //check
     /*  await request(app)
        .get(`/users/` + createdVideo1.id)
        .expect(HTTP_STATUSES.OK_200, createdVideo1)    */  
      }); 
 

})
