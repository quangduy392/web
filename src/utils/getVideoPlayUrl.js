import API_CONFIG from '../api-config';

const getVideoPlayUrl = videoId => {
    const apiLink = API_CONFIG.BASE_URL + _.get(API_CONFIG, 'video.videoPlay');
    return apiLink.replace(/:id/g, videoId);
};

export default getVideoPlayUrl;
