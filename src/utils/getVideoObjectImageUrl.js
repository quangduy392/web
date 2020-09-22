import API_CONFIG from '../api-config';

const getVideoObjectImageUrl = videoObject => {
    const apiLink = API_CONFIG.BASE_URL + _.get(API_CONFIG, 'videoObject.image');
    return apiLink.replace(/:videoId/g, videoObject.video.id).replace(/:objectId/g, videoObject.id);
};

export default getVideoObjectImageUrl;
