import { nanoid } from 'nanoid';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        let { image } = req.body;

        if (!image) {
            return res.status(500).json({ message: 'No image provided' });
        }

        try {
            const contentType = image.match(/data:(.*);base64/)?.[1];
            const base64FileData = image.split('base64,')?.[1];

            if (!contentType || !base64FileData) {
                return res.status(500).json({message: 'Image data not valid'});
            }

            const fileName = nanoid();
            const ext = contentType.split('/')[1];
            const path = `${fileName}.${ext}`;

            const {data, error: uploadError} = await supabase.storage
                .from(process.env.SUPABASE_BUCKET)
                .upload(path, decode(base64FileData), {
                    contentType,
                    upsert: true,
                });

            if (uploadError) {
                return res.status(500).json({message: 'Could not upload image'});
            }

            const url = `${process.env.SUPABASE_URL.replace('.co', '.in')}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${data.path}`;
            return res.status(200).json({url});
        } catch (e) {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
    else
    {
        res.setHeader('Allow', ['POST']);
        res
            .status(405)
            .json({ message: `HTTP method ${req.method} is not supported.` });
    }
}