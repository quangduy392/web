import API_CONFIG from '../api-config';
import CONSTANTS from '../constants';

const getVideoSnapshotUrl = (videoId, size = CONSTANTS.VIDEO_SNAPSHOT_SIZE.MEDIUM) => {
    const apiLink = API_CONFIG.BASE_URL + _.get(API_CONFIG, `videoSnapshot.${size}`);
    return apiLink.replace(/:id/g, videoId);
};

export default getVideoSnapshotUrl;
