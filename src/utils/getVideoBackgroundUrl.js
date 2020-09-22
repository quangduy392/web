import API_CONFIG from '../api-config';

const getVideoBackgroundUrl = videoId => {
    const apiLink = API_CONFIG.BASE_URL + _.get(API_CONFIG, 'video.backgroundImage');
    return apiLink.replace(/:id/g, videoId);
};

export default getVideoBackgroundUrl;
