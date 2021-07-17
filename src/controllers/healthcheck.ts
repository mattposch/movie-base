import { Request, Response } from 'express';

export const healthcheck = async (req: Request, res: Response): Promise<void> => {
    res.send('OK');
};
