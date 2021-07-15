import { Request, Response } from 'express';
import axios from 'axios';

export const THEMOVIEDB_APIKEY = process.env['THEMOVIEDB_APIKEY'];

export const search = async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.query as string) ?? undefined;
    const result = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${THEMOVIEDB_APIKEY}&query=${query}`);
    res.send(result.data);

};
