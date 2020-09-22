import moment from 'moment-timezone';

const getObjectTime = object => {
    if (!object.video || !object.frames || !object.frames.length) return '';
    const videoTime = object.video.time;
    const objectTime = moment(videoTime).add(object.frames[0].time, 'milliseconds');

    return objectTime;
};

export default getObjectTime;
