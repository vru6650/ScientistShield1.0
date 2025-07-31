/**
 * A service file for tutorial-related API calls.
 */

/**
 * Fetches tutorials based on query parameters.
 * @param {string} searchQuery - URL encoded query string (e.g., 'limit=5&category=reactjs').
 * @returns {Promise<object>} The data containing the tutorials array and total counts.
 * @throws {Error} Throws an error if the network response is not ok.
 */
export const getTutorials = async (searchQuery) => {
    const res = await fetch(`/api/tutorial/gettutorials?${searchQuery}`);
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to fetch tutorials');
    }
    return res.json();
};

/**
 * Fetches a single tutorial by its slug.
 * @param {string} tutorialSlug - The slug of the tutorial.
 * @returns {Promise<import('../types').Tutorial>} The tutorial data.
 * @throws {Error} Throws an error if the tutorial is not found or fetch fails.
 */
export const getSingleTutorial = async (tutorialSlug) => {
    const res = await fetch(`/api/tutorial/getsingletutorial/${tutorialSlug}`);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch tutorial.');
    }
    return data;
};

/**
 * Creates a new tutorial.
 * @param {object} formData - The tutorial data to create.
 * @returns {Promise<import('../types').Tutorial>} The created tutorial data.
 * @throws {Error} Throws an error if creation fails.
 */
export const createTutorial = async (formData) => {
    const res = await fetch('/api/tutorial/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to create tutorial.');
    }
    return data;
};

/**
 * Updates an existing tutorial.
 * @param {object} params
 * @param {string} params.tutorialId - ID of the tutorial to update.
 * @param {string} params.userId - ID of the user performing the update (for authorization).
 * @param {object} params.formData - The updated tutorial data.
 * @returns {Promise<import('../types').Tutorial>} The updated tutorial data.
 * @throws {Error} Throws an error if update fails.
 */
export const updateTutorial = async ({ tutorialId, userId, formData }) => {
    const res = await fetch(`/api/tutorial/update/${tutorialId}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to update tutorial.');
    }
    return data;
};

/**
 * Deletes a tutorial.
 * @param {object} params
 * @param {string} params.tutorialId - ID of the tutorial to delete.
 * @param {string} params.userId - ID of the user performing the delete (for authorization).
 * @returns {Promise<string>} Success message.
 * @throws {Error} Throws an error if deletion fails.
 */
export const deleteTutorial = async ({ tutorialId, userId }) => {
    const res = await fetch(`/api/tutorial/delete/${tutorialId}/${userId}`, {
        method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to delete tutorial.');
    }
    return data;
};

/**
 * Adds a new chapter to a tutorial.
 * @param {object} params
 * @param {string} params.tutorialId - ID of the tutorial to add chapter to.
 * @param {string} params.userId - ID of the user performing the action.
 * @param {object} params.chapterData - Data for the new chapter (title, content, order).
 * @returns {Promise<import('../types').TutorialChapter>} The newly created chapter data.
 * @throws {Error} Throws an error if chapter addition fails.
 */
export const addTutorialChapter = async ({ tutorialId, userId, chapterData }) => {
    const res = await fetch(`/api/tutorial/addchapter/${tutorialId}/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapterData),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to add chapter.');
    }
    return data;
};

/**
 * Updates an existing chapter in a tutorial.
 * @param {object} params
 * @param {string} params.tutorialId - ID of the parent tutorial.
 * @param {string} params.chapterId - ID of the chapter to update.
 * @param {string} params.userId - ID of the user performing the action.
 * @param {object} params.chapterData - Updated chapter data.
 * @returns {Promise<import('../types').TutorialChapter>} The updated chapter data.
 * @throws {Error} Throws an error if chapter update fails.
 */
export const updateTutorialChapter = async ({ tutorialId, chapterId, userId, chapterData }) => {
    const res = await fetch(`/api/tutorial/updatechapter/${tutorialId}/${chapterId}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chapterData),
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to update chapter.');
    }
    return data;
};

/**
 * Deletes a chapter from a tutorial.
 * @param {object} params
 * @param {string} params.tutorialId - ID of the parent tutorial.
 * @param {string} params.chapterId - ID of the chapter to delete.
 * @param {string} params.userId - ID of the user performing the action.
 * @returns {Promise<string>} Success message.
 * @throws {Error} Throws an error if chapter deletion fails.
 */
export const deleteTutorialChapter = async ({ tutorialId, chapterId, userId }) => {
    const res = await fetch(`/api/tutorial/deletechapter/${tutorialId}/${chapterId}/${userId}`, {
        method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to delete chapter.');
    }
    return data;
};