// ==UserScript==
// @name         YouTube Playlist Filter
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  Add a search filter to YouTube's "Save to Playlist" popup
// @author       htsachakis
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-end
// @downloadURL  https://github.com/htsachakis/YouTubeFilter/raw/refs/heads/main/YouTubeFilter.user.js
// @updateURL    https://github.com/htsachakis/YouTubeFilter/raw/refs/heads/main/YouTubeFilter.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Log to confirm script is running
  console.log('[YouTubeFilter] Script loaded!');

  // Configuration
  const CONFIG = {
    SEARCH_INPUT_ID: 'yt-filter-playlist-search',
    SEARCH_CONTAINER_ID: 'yt-filter-playlist-container',
    FILTERED_CLASS: 'yt-filter-hidden',
  };

  // State
  let searchInput = null;
  let playlistPopup = null;

  /**
   * Initialize the script
   */
  function init() {
    console.log('[YouTubeFilter] Initializing...');
    injectStyles();
    setupPopupObserver();
  }

  /**
   * Inject CSS styles for the search input and filtered playlists
   */
  function injectStyles() {
    const css = `
      #${CONFIG.SEARCH_CONTAINER_ID} {
        padding: 12px 16px;
        border-bottom: 1px solid var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.1));
        background-color: transparent;
        flex-shrink: 0;
      }

      #${CONFIG.SEARCH_INPUT_ID} {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--yt-spec-10-percent-layer, rgba(0, 0, 0, 0.2));
        border-radius: 2px;
        font-size: 13px;
        font-family: "Roboto", "Arial", sans-serif;
        box-sizing: border-box;
        background-color: transparent;
        color: var(--yt-spec-text-primary, #030303);
        transition: border-color 0.2s;
      }

      #${CONFIG.SEARCH_INPUT_ID}::placeholder {
        color: var(--yt-spec-text-secondary, rgba(0, 0, 0, 0.54));
      }

      #${CONFIG.SEARCH_INPUT_ID}:focus {
        outline: none;
        border-color: var(--yt-spec-call-to-action, #065fd4);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
      }

      .${CONFIG.FILTERED_CLASS} {
        display: none !important;
      }
    `;

    GM_addStyle(css);
  }

  /**
   * Set up an observer to detect when the playlist popup opens
   */
  function setupPopupObserver() {
    // Observe the entire document for popup appearance
    const observer = new MutationObserver(function (mutations) {
      // Look for the playlist popup - YouTube uses tp-yt-iron-dropdown for the save popup
      const popups = document.querySelectorAll('tp-yt-iron-dropdown, tp-yt-paper-dialog, .yt-dialog, [role="dialog"]');

      for (const popup of popups) {
        // Check if this popup contains playlist items (by looking for yt-list-item-view-model)
        if (popup.querySelector('yt-list-item-view-model') && !popup.hasAttribute('data-playlist-filter-added')) {
          console.log('[YouTubeFilter] Playlist popup detected');
          popup.setAttribute('data-playlist-filter-added', 'true');
          enhancePlaylistPopup(popup);
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Enhance the playlist popup with a search input
   * @param {Element} popup - The playlist popup element
   */
  function enhancePlaylistPopup(popup) {
    // Wait a moment for the popup to fully render
    setTimeout(() => {
      const playlistContainer = findPlaylistContainer(popup);

      if (!playlistContainer) {
        console.log('[YouTubeFilter] Could not find playlist container');
        return;
      }

      // Check if search input already exists
      const existingInput = document.getElementById(CONFIG.SEARCH_INPUT_ID);
      if (existingInput) {
        console.log('[YouTubeFilter] Search input already exists, clearing it');
        searchInput = existingInput;
        playlistPopup = popup;

        // Clear the filter and show all playlists
        clearFilterAndShowAll();

        // Set up listeners for the reopened popup
        setupPlaylistClickListener(popup);
        setupOutsideClickListener(popup);
        setupPopupCloseObserver(popup);

        return;
      }

      // Create and inject the search input
      const searchContainer = createSearchContainer();
      playlistContainer.insertBefore(searchContainer, playlistContainer.firstChild);

      searchInput = document.getElementById(CONFIG.SEARCH_INPUT_ID);
      playlistPopup = popup;

      // Set up event listener for filtering
      searchInput.addEventListener('input', handleSearchInput);

      // Set up listener to clear input when a playlist is clicked
      setupPlaylistClickListener(popup);

      // Set up listener to clear input when clicking outside the popup
      setupOutsideClickListener(popup);

      // Set up observer to detect when popup closes
      setupPopupCloseObserver(popup);

      console.log('[YouTubeFilter] Search input injected successfully');
    }, 100);
  }

  /**
   * Find the container that holds the playlist items
   * @param {Element} popup - The playlist popup element
   * @returns {Element|null} The playlist container or null if not found
   */
  function findPlaylistContainer(popup) {
    // YouTube uses yt-list-view-model for the playlist list
    const playlistList = popup.querySelector('yt-list-view-model[role="list"]');
    if (playlistList) {
      return playlistList;
    }

    // Fallback to older structure if needed
    const selectors = [
      '[role="listbox"]', // Standard ARIA pattern
      'yt-list-view-model', // YouTube list component
      '.yt-simple-menu-item', // Custom YouTube menu items
    ];

    for (const selector of selectors) {
      const element = popup.querySelector(selector);
      if (element) {
        return element;
      }
    }

    // Fallback: return the entire popup
    return popup;
  }

  /**
   * Create the search input container
   * @returns {Element} The search container element
   */
  function createSearchContainer() {
    const container = document.createElement('div');
    container.id = CONFIG.SEARCH_CONTAINER_ID;

    const input = document.createElement('input');
    input.id = CONFIG.SEARCH_INPUT_ID;
    input.type = 'text';
    input.placeholder = 'Filter playlists...';

    // Prevent click events from closing the popup, but allow input to work
    container.addEventListener('click', (e) => {
      e.stopPropagation();
    }, true);

    input.addEventListener('click', (e) => {
      e.stopPropagation();
    }, true);

    input.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    }, true);

    container.appendChild(input);
    return container;
  }

  /**
   * Handle search input changes and filter playlists
   * @param {Event} event - The input event
   */
  function handleSearchInput(event) {
    const searchQuery = event.target.value.toLowerCase().trim();

    if (!playlistPopup) {
      console.log('[YouTubeFilter] Playlist popup not set');
      return;
    }

    // Find all playlist items (will need adjustment based on actual YouTube structure)
    const playlistItems = findPlaylistItems(playlistPopup);

    console.log(`[YouTubeFilter] Filtering ${playlistItems.length} playlists with query: "${searchQuery}"`);

    playlistItems.forEach((item) => {
      if (searchQuery === '') {
        // Show all items if search is empty
        item.classList.remove(CONFIG.FILTERED_CLASS);
      } else {
        // Get the playlist name from the item
        const playlistName = extractPlaylistName(item).toLowerCase();

        // Check if playlist name matches the search query
        if (playlistName.includes(searchQuery)) {
          item.classList.remove(CONFIG.FILTERED_CLASS);
        } else {
          item.classList.add(CONFIG.FILTERED_CLASS);
        }
      }
    });
  }

  /**
   * Find all playlist items in the popup
   * @param {Element} popup - The playlist popup element
   * @returns {Element[]} Array of playlist item elements
   */
  function findPlaylistItems(popup) {
    // YouTube's playlist items use yt-list-item-view-model with role="listitem"
    const items = Array.from(popup.querySelectorAll('yt-list-item-view-model[role="listitem"]'));

    if (items.length > 0) {
      console.log(`[YouTubeFilter] Found ${items.length} playlist items`);
      return items;
    }

    // Fallback to alternative selectors if the primary one doesn't work
    const selectors = [
      '[role="listitem"]', // Standard ARIA pattern
      'toggleable-list-item-view-model', // YouTube toggleable item wrapper
      '.yt-simple-menu-item', // Custom YouTube menu items
    ];

    for (const selector of selectors) {
      const fallbackItems = Array.from(popup.querySelectorAll(selector));
      if (fallbackItems.length > 0) {
        console.log(`[YouTubeFilter] Found ${fallbackItems.length} items using fallback selector: ${selector}`);
        return fallbackItems;
      }
    }

    return [];
  }

  /**
   * Extract the playlist name from a playlist item element
   * @param {Element} item - The playlist item element
   * @returns {string} The playlist name
   */
  function extractPlaylistName(item) {
    // YouTube uses specific class for the title in yt-list-item-view-model
    const titleElement = item.querySelector('.yt-list-item-view-model__title');
    if (titleElement) {
      return titleElement.textContent.trim();
    }

    // Fallback: try to get from aria-label (contains playlist info)
    const ariaLabel = item.getAttribute('aria-label');
    if (ariaLabel) {
      // aria-label format is typically "PlaylistName, Status, State"
      // Extract just the first part (playlist name)
      const parts = ariaLabel.split(',');
      return parts[0].trim();
    }

    // Last resort: get all text content
    return item.textContent.trim().split('\n')[0];
  }

  /**
   * Set up listener to clear input when a playlist is clicked
   * @param {Element} popup - The playlist popup element
   */
  function setupPlaylistClickListener(popup) {
    // Listen for clicks on playlist items
    popup.addEventListener('click', (event) => {
      // Check if the click was on a playlist item or its children
      const playlistItem = event.target.closest('yt-list-item-view-model[role="listitem"]');

      if (playlistItem && searchInput) {
        console.log('[YouTubeFilter] Playlist item clicked, clearing filter');
        clearFilterAndShowAll();
      }
    }, true); // Use capture phase to catch the event early
  }

  /**
   * Set up listener to clear input when clicking outside the popup
   * @param {Element} popup - The playlist popup element
   */
  function setupOutsideClickListener(popup) {
    // Listen for clicks on the document
    const outsideClickHandler = (event) => {
      // Check if the click was outside the popup
      if (searchInput && !popup.contains(event.target)) {
        console.log('[YouTubeFilter] Clicked outside popup, clearing filter');
        clearFilterAndShowAll();
      }
    };

    // Add listener with a small delay to avoid immediate triggering
    setTimeout(() => {
      document.addEventListener('click', outsideClickHandler, true);
    }, 200);

    // Store the handler so we can remove it later
    popup._outsideClickHandler = outsideClickHandler;
  }

  /**
   * Set up observer to detect when the popup closes
   * @param {Element} popup - The playlist popup element
   */
  function setupPopupCloseObserver(popup) {
    // Observe when the popup is removed from the DOM or hidden
    const observer = new MutationObserver((mutations) => {
      // Check if popup is still in the document
      if (!document.contains(popup)) {
        console.log('[YouTubeFilter] Popup closed, cleaning up');
        cleanupPopup(popup);
        observer.disconnect();
      }
    });

    // Observe the popup's parent to detect when it's removed
    if (popup.parentNode) {
      observer.observe(popup.parentNode, {
        childList: true,
      });
    }
  }

  /**
   * Clear the filter input and show all playlists
   */
  function clearFilterAndShowAll() {
    if (searchInput) {
      searchInput.value = '';

      // Clear all filters to show all playlists again
      if (playlistPopup) {
        const playlistItems = findPlaylistItems(playlistPopup);
        playlistItems.forEach((item) => {
          item.classList.remove(CONFIG.FILTERED_CLASS);
        });
      }
    }
  }

  /**
   * Clean up when popup closes
   * @param {Element} popup - The playlist popup element
   */
  function cleanupPopup(popup) {
    if (searchInput) {
      searchInput.removeEventListener('input', handleSearchInput);
    }

    // Remove outside click listener
    if (popup && popup._outsideClickHandler) {
      document.removeEventListener('click', popup._outsideClickHandler, true);
      delete popup._outsideClickHandler;
    }

    searchInput = null;
    playlistPopup = null;
  }

  // Initialize the script immediately (since we're using document-end)
  try {
    init();
    console.log('[YouTubeFilter] Initialization complete');
  } catch (error) {
    console.error('[YouTubeFilter] Error during initialization:', error);
  }
})();