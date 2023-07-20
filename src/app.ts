import express, { Request, Response } from "express";
import { HTTP_STATUSES } from "./utils";

export const app = express();

const parseMiddleware = express.json();
app.use(parseMiddleware);
type RequestWithParams <P> = Request <P, {}, {}, {}>;
type RequestWithBody <B> = Request <{}, {}, B, {}>;
type RequestWithBodyAndParams <P, B> = Request <P, {}, B, {}>;

export enum AvailableResolutions {
    P144 = "P144",
    P240 = "P240",
    P360 = "P360",
    P480 = "P480",
    P720 = "P720",
    P1080 = "P1080",
    P1440 = "P1440",
    P2160 = "P2160"
}

type VideoType = {
    id: number,
    title: string,
    author: string,
    canBeDownloaded: boolean,
    minAgeRestriction: number | null,
    createdAt: string,
    publicationDate: string,
    availableResolutions: AvailableResolutions []
}

type ErrorMessageType = {
    messsage: string;
    field: string
}

type ErrorType = {
    errorMessages: ErrorMessageType []
}

let videos: VideoType [] = [
    {
        id: 0,
        title: "string",
        author: "string",
        canBeDownloaded: true,
        minAgeRestriction: null,
        createdAt: "2023-07-17T15:51:00.188Z",
        publicationDate: "2023-07-17T15:51:00.188Z",
        availableResolutions: [
          AvailableResolutions.P144
        ]
      }
]

app.get('/videos', (req: Request, res: Response) => {
  res.status(HTTP_STATUSES.OK_200).send(videos)
})

app.get('/videos/:id', (req: RequestWithParams <{id: number}>, res: Response) => {
   const id = +req.params.id;
   const foundVideo = videos.find(v => v.id === id);
   if (foundVideo){
    res.send(foundVideo)
   } else {
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
   }
  })

app.post("/videos", (req: RequestWithBody<{ title: string, author: string, availableResolutions: AvailableResolutions[]}>, res: Response)=> {
    //errors validation
    let errors: ErrorType = {
        errorMessages: []
    };

    let {title, author, availableResolutions} = req.body;

    if (!title || !title.length || title.trim().length > 40){
        errors.errorMessages.push({messsage: "Invalid title", field: "title"})
    };
    if (!author || !author.length || author.trim().length > 20){
        errors.errorMessages.push({messsage: "Invalid author", field: "author"})
    };
    if (Array.isArray(availableResolutions)){
        availableResolutions.map(resolut => {
            !AvailableResolutions[resolut] && errors.errorMessages.push({
                messsage: "Invalid availableResolutions",
                field: "availableResolutions"
            })
        })
    } else {
        availableResolutions = [];
    }

    if(errors.errorMessages.length){
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
        return;
    }

    const createdAt: Date = new Date();
    const publicationDate = new Date();
    publicationDate.setDate(createdAt.getDate()+1);

    const newVideo: VideoType = {
        id: +(new Date()),
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: createdAt.toISOString(),
        publicationDate: createdAt.toISOString(),
        title,
        author,
        availableResolutions
    };

    videos.push(newVideo);
    res.status(HTTP_STATUSES.CREATED_201).send(newVideo);
})

app.put("/videos/:id", (req: RequestWithBodyAndParams<{id: number}, { title: string, author: string }>, res: Response) =>{
    const id = +req.params.id;
    let foundVideo = videos.find(v => v.id === id);

    if(!foundVideo){
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
    };//check if such video doesn t exist

    const {title, author} = req.body;

    //errors validation
    let errors: ErrorType = {
        errorMessages: []
    };
    if (!title || !title.length || title.trim().length > 40){
        errors.errorMessages.push({messsage: "Invalid title", field: "title"})
    };
    if (!author || !author.length || author.trim().length > 20){
        errors.errorMessages.push({messsage: "Invalid author", field: "author"})
    };

    if(errors.errorMessages.length){
        res.status(HTTP_STATUSES.BAD_REQUEST_400).send(errors);
        return;
    }

    // if everything is ok
    if (foundVideo){
    foundVideo.title = title;
    foundVideo.author = author;
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);   
    }
     
})

app.delete("/videos/:id", (req: RequestWithParams <{id: number}>, res: Response) => {
    const id = +req.params.id;
    const deleteVideo = videos.find(v => v.id === id);
    if (deleteVideo){
     videos = videos.filter(v => v.id !== id);
     res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    } else {
     res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
})

app.delete("/__test__/data", (req: Request, res: Response) => {
    videos = [];
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})