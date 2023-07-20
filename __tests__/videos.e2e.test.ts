import request from "supertest";
import { AvailableResolutions, app } from "../src/app";
import { HTTP_STATUSES } from "../src/utils";

const invalidTitleObj = {
  "errorsMessages": [
      {
          "message": "Invalid title",
          "field": "title"
      }
  ]
};
const invalidAuthorObj = {
  "errorsMessages": [
      {
          "message": "Invalid author",
          "field": "author"
      }
  ]
};
const invalidResolutionObj = {
  "errorsMessages": [
      {
          "message": "Invalid availableResolutions",
          "field": "availableResolutions"
      }
  ]
};

describe("/videos", () => {

    beforeAll(async() => {
        await request(app).delete('/testing/all-data');
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
        .expect(HTTP_STATUSES.BAD_REQUEST_400, invalidTitleObj);        
    }); 

    it("shouldn't create new video because or wrong author", async() => {
      await request(app)
        .post("/videos")
        .send({title: "Tomas first words", author: "", availableResolutions:  [AvailableResolutions.P1080]})
        .expect(HTTP_STATUSES.BAD_REQUEST_400, invalidAuthorObj);        
    });

    it("shouldn't create new video because or wrong availableResolutions", async() => {
      await request(app)
        .post("/videos")
        .send({title: "Tomas first words", author: "Here", availableResolutions: [22]})
        .expect(HTTP_STATUSES.BAD_REQUEST_400, invalidResolutionObj);          
    });

    let createdVideo1: any = null;
    it("should create new video1", async() => {
      const response = await request(app)
        .post("/videos")
        .send({title: "Sashullliaa", author: "Here", availableResolutions: [AvailableResolutions.P144]})
        .expect(HTTP_STATUSES.CREATED_201);
        
        createdVideo1 = response.body;
        expect(createdVideo1).toEqual({
          id: expect.any(Number),
          author: "Here",
          title: "Sashullliaa",
          minAgeRestriction: null,
          publicationDate: expect.any(String),
          availableResolutions:  [AvailableResolutions.P144],
          canBeDownloaded: false,
          createdAt: expect.any(String),
        });

        await request(app)
        .get("/videos")
        .expect(HTTP_STATUSES.OK_200, [createdVideo1])
    });

    let createdVideo2: any = null;
    it("should create new video2 and update its title", async() => {
      const response = await request(app)
        .post("/videos")
        .send({title: "Clarity Team forever", author: "Potraha", availableResolutions: [AvailableResolutions.P144, AvailableResolutions.P2160]})
        .expect(HTTP_STATUSES.CREATED_201);
        
        createdVideo2 = response.body; 

        expect(createdVideo2).toEqual({
          id: expect.any(Number),
          author: "Potraha",
          title: "Clarity Team forever",
          minAgeRestriction: null,
          publicationDate: expect.any(String),
          availableResolutions:  [AvailableResolutions.P144, AvailableResolutions.P2160],
          canBeDownloaded: false,
          createdAt: expect.any(String),
        })

        await request(app)
        .get("/videos")
        .expect(HTTP_STATUSES.OK_200, [createdVideo1, createdVideo2])
    });

    it(`shouldn't update video because such ID video diesn/t exist`, async() => {
       await request(app)
        .put(`/videos/` + 11)
        .send({title: "", author: "Veronika Bluuuuzz"})
        .expect(HTTP_STATUSES.NOT_FOUND_404);   
      }); 

      const createdAt: Date = new Date();
      const publicationDate = new Date();
      publicationDate.setDate(createdAt.getDate()+1);

    let updateBodyWithIncorrectTitle = {
      title: "", 
      author: "Veronika Bluuuuzz",
      availableResolutions: [AvailableResolutions.P144, AvailableResolutions.P2160], 
      canBeDownloaded: false,
      minAgeRestriction: 11,
      publicationDate: publicationDate,
      };

    let updateBodyWithIncorrectAuthor = {
      title: "QmateFuc", 
      author: "",
      availableResolutions: [AvailableResolutions.P144, AvailableResolutions.P2160], 
      canBeDownloaded: false,
      minAgeRestriction: 11,
      publicationDate: publicationDate,
    };

    let updateBodyWithCorrectData = {
      title: "Andreas", 
      author: "Konstantin Michaelis",
      canBeDownloaded: true,
      minAgeRestriction: 11,
      publicationDate: publicationDate,
      availableResolutions: [AvailableResolutions.P144, AvailableResolutions.P2160], 
    };

      it(`shouldn't update video because title is wrong`, async() => {
        await request(app)
         .put(`/videos/` + createdVideo1.id)
         .send(updateBodyWithIncorrectTitle)
         .expect(HTTP_STATUSES.BAD_REQUEST_400, invalidTitleObj);   
       }); 

       it(`shouldn't update video because author is wrong`, async() => {
        await request(app)
         .put(`/videos/` + createdVideo1.id)
         .send(updateBodyWithIncorrectAuthor)
         .expect(HTTP_STATUSES.BAD_REQUEST_400, invalidAuthorObj);   
       }); 

       it(`should update video `, async() => {
        await request(app)
         .put(`/videos/` + createdVideo1.id)
         .send(updateBodyWithCorrectData)
         .expect(HTTP_STATUSES.NO_CONTENT_204);
       });

       it(`should delete video by id`, async() => {

        await request(app)
         .delete(`/videos/` + createdVideo1.id)
         .expect(HTTP_STATUSES.NO_CONTENT_204);
         
         await request(app)
         .get(`/videos/` + createdVideo1.id)
         .expect(HTTP_STATUSES.NOT_FOUND_404);

         await request(app)
         .get(`/videos/` + createdVideo2.id)
         .expect(HTTP_STATUSES.OK_200, createdVideo2)   
       });


       it(`should delete all videos`, async() => {

        await request(app)
         .delete(`/testing/all-data`)
         .expect(HTTP_STATUSES.NO_CONTENT_204);
         
         await request(app)
         .get(`/videos/`)
         .expect(HTTP_STATUSES.OK_200), [];
       });

  });