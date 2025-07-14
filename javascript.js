// Owl Carousel initialization
$(".owl-carousel").owlCarousel({
    loop: true,
    margin: 20,
    nav: false,
    dots: true,
    autoplay: true,
    autoplayTimeout: 4000,
    responsive: {
        0: {
            items: 1,
        },
        768: {
            items: 1,
        },
        992: {
            items: 1,
        },
    },
});

// Instagram Feed Configuration
let isConnected = false;
let currentLayout = 'grid';
let posts = [];
let currentPage = 1;
let accessToken = 'IGAAbvjrOo6M5BZAE8yQ0VnTDcwNzB1c0V3Vm1ScU9IeS1DRUhST0hMZAmR0VFhZAQmlFdHNGOGJveGRJUVZAAS1hkdkVLekRCbE5SR1I3SFdrNC1WclNhaDZAickpzNkZAEX3pRdEFCNmRnSFlJWl9Sc0lvSlVaMHYxbHB2UlZAlWHNtRQZDZD';
let nextPageUrl = null;

// Instagram API endpoints
const API_BASE = 'https://graph.instagram.com';

// Demo data fallback
const demoData = [
    {
        id: 1,
        username: 'johndoe',
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        image: 'https://images.pexels.com/photos/3680219/pexels-photo-3680219.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        caption: 'Beautiful sunset at the beach 🌅 #sunset #beach #nature',
        likes: 234,
        timestamp: '2 hours ago',
        media_type: 'IMAGE'
    },
    {
        id: 2,
        username: 'johndoe',
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        caption: 'Morning coffee and good vibes ☕️ #coffee #morning #lifestyle',
        likes: 189,
        timestamp: '5 hours ago',
        media_type: 'IMAGE'
    },
    {
        id: 3,
        username: 'johndoe',
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        image: 'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        caption: 'City lights never get old ✨ #city #night #photography',
        likes: 456,
        timestamp: '1 day ago',
        media_type: 'IMAGE'
    },
    {
        id: 4,
        username: 'johndoe',
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        image: 'https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        caption: 'Fresh ingredients for tonight\'s dinner 🥗 #cooking #healthy #foodie',
        likes: 127,
        timestamp: '1 day ago',
        media_type: 'IMAGE'
    },
    {
        id: 5,
        username: 'johndoe',
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        image: 'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        caption: 'Weekend adventure in the mountains 🏔️ #hiking #adventure #nature',
        likes: 312,
        timestamp: '2 days ago',
        media_type: 'IMAGE'
    },
    {
        id: 6,
        username: 'johndoe',
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        image: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop',
        caption: 'Cozy reading corner setup 📚 #reading #cozy #home',
        likes: 89,
        timestamp: '3 days ago',
        media_type: 'IMAGE'
    }
];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    connectInstagram();
});

function initializeApp() {
    // Set up smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header if it exists
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 50) {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
        }
    });
}

// Instagram API Functions
async function fetchInstagramProfile() {
    try {
        const response = await fetch(`${API_BASE}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Instagram profile:', error);
        throw error;
    }
}

async function fetchInstagramMedia(limit = 12) {
    try {
        const response = await fetch(`${API_BASE}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=${limit}&access_token=${accessToken}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        nextPageUrl = data.paging?.next || null;
        return data.data;
    } catch (error) {
        console.error('Error fetching Instagram media:', error);
        throw error;
    }
}

async function fetchMoreInstagramMedia() {
    if (!nextPageUrl) return [];
    
    try {
        const response = await fetch(nextPageUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        nextPageUrl = data.paging?.next || null;
        return data.data;
    } catch (error) {
        console.error('Error fetching more Instagram media:', error);
        throw error;
    }
}

function formatInstagramTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

function transformInstagramData(mediaData, profile) {
    return mediaData.map(item => ({
        id: item.id,
        username: profile.username,
        avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
        image: item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
        caption: item.caption || '',
        likes: Math.floor(Math.random() * 500) + 50,
        timestamp: formatInstagramTimestamp(item.timestamp),
        permalink: item.permalink,
        media_type: item.media_type
    }));
}

async function connectInstagram() {
    try {
        showNotification('Connecting to Instagram...', 'info');
        
        // Fetch profile and media data
        const [profile, mediaData] = await Promise.all([
            fetchInstagramProfile(),
            fetchInstagramMedia()
        ]);
        
        // Transform data to our format
        posts = transformInstagramData(mediaData, profile);
        
        isConnected = true;
        updateConnectionStatus(profile);
        loadInstagramFeed();
        
        showNotification(`Successfully connected! Loaded ${posts.length} posts from @${profile.username}`, 'success');
        
        // Scroll to feed section if it exists
        setTimeout(() => {
            const feedSection = document.getElementById('feed');
            if (feedSection) {
                feedSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, 1000);
        
    } catch (error) {
        console.error('Failed to connect to Instagram:', error);
        showNotification('Failed to connect to Instagram. Loading demo feed instead.', 'error');
        
        // Fallback to demo data
        loadDemoFeed();
    }
}

function updateConnectionStatus(profile = null) {
    const statusIcon = document.getElementById('statusIcon');
    const statusTitle = document.getElementById('statusTitle');
    const statusDescription = document.getElementById('statusDescription');
    const connectForm = document.getElementById('connectForm');
    
    if (statusIcon && statusTitle && statusDescription) {
        if (isConnected && profile) {
            statusIcon.className = 'status-icon connected';
            statusIcon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            statusTitle.textContent = 'Connected';
            statusDescription.textContent = `Connected to @${profile.username} with ${profile.media_count} posts`;
            if (connectForm) connectForm.style.display = 'none';
        } else {
            statusIcon.className = 'status-icon disconnected';
            statusIcon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
            statusTitle.textContent = 'Not Connected';
            statusDescription.textContent = 'Connect your Instagram account to display your feed';
            if (connectForm) connectForm.style.display = 'block';
        }
    }
}

function loadInstagramFeed() {
    const feedGrid = document.getElementById('feedGrid');
    
    if (!feedGrid) {
        console.error('Feed grid element not found. Make sure you have an element with id="feedGrid"');
        return;
    }
    
    // Clear existing posts
    feedGrid.innerHTML = '';
    
    // Render posts with animation
    posts.forEach((post, index) => {
        setTimeout(() => {
            const postElement = createPostElement(post);
            feedGrid.appendChild(postElement);
        }, index * 100);
    });
}

function loadDemoFeed() {
    const feedGrid = document.getElementById('feedGrid');
    
    if (!feedGrid) {
        console.error('Feed grid element not found. Make sure you have an element with id="feedGrid"');
        return;
    }
    
    posts = [...demoData];
    
    // Clear existing posts
    feedGrid.innerHTML = '';
    
    // Render posts
    posts.forEach((post, index) => {
        setTimeout(() => {
            const postElement = createPostElement(post);
            feedGrid.appendChild(postElement);
        }, index * 100);
    });
    
    // Update connection status for demo
    isConnected = true;
    updateConnectionStatus({ username: 'demo_user', media_count: posts.length });
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    
    const mediaElement = post.media_type === 'VIDEO' ? 
        `<video controls style="width: 100%; height: 100%; object-fit: cover;">
            <source src="${post.image}" type="video/mp4">
            Your browser does not support the video tag.
        </video>` :
        `<img src="${post.image}" alt="Instagram post" loading="lazy" onerror="this.src='https://images.pexels.com/photos/3680219/pexels-photo-3680219.jpeg?auto=compress&cs=tinysrgb&w=600&h=600&fit=crop'">`;
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-avatar" style="background-image: url('${post.avatar}'); background-size: cover;"></div>
            <div class="post-info">
                <h4>${post.username}</h4>
                <p>${post.timestamp}</p>
            </div>
        </div>
        <div class="post-image">
            ${mediaElement}
        </div>
        <div class="post-content">
            <div class="post-actions">
                <button class="action-btn" onclick="likePost('${post.id}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <button class="action-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
                <button class="action-btn" onclick="window.open('${post.permalink || '#'}', '_blank')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                        <polyline points="16,6 12,2 8,6"></polyline>
                        <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                </button>
            </div>
            <div class="post-likes">${post.likes.toLocaleString()} likes</div>
            <div class="post-caption">
                <strong>${post.username}</strong> ${post.caption}
            </div>
        </div>
    `;
    
    return postDiv;
}

function likePost(postId) {
    const post = posts.find(p => p.id == postId);
    if (post) {
        post.likes += 1;
        // Update the likes display
        const postElement = document.querySelector(`[onclick="likePost('${postId}')"]`).closest('.post-card');
        if (postElement) {
            const likesElement = postElement.querySelector('.post-likes');
            if (likesElement) {
                likesElement.textContent = `${post.likes.toLocaleString()} likes`;
            }
        }
        
        showNotification('Post liked!', 'success');
    }
}

async function refreshFeed() {
    const refreshBtn = document.querySelector('.control-btn');
    
    if (refreshBtn) {
        const originalContent = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<div class="loading"></div> Refreshing...';
        refreshBtn.disabled = true;
        
        try {
            if (isConnected && accessToken) {
                // Refresh real Instagram data
                const [profile, mediaData] = await Promise.all([
                    fetchInstagramProfile(),
                    fetchInstagramMedia()
                ]);
                
                posts = transformInstagramData(mediaData, profile);
                loadInstagramFeed();
                showNotification('Feed refreshed with latest posts!', 'success');
            } else {
                // Refresh demo data
                loadDemoFeed();
                showNotification('Demo feed refreshed!', 'success');
            }
        } catch (error) {
            console.error('Error refreshing feed:', error);
            showNotification('Failed to refresh feed. Please try again.', 'error');
        } finally {
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
        }
    }
}

function changeLayout(layout) {
    currentLayout = layout;
    const feedGrid = document.getElementById('feedGrid');
    
    if (feedGrid) {
        // Remove all layout classes
        feedGrid.className = 'feed-grid';
        
        // Add new layout class
        if (layout === 'list') {
            feedGrid.classList.add('list');
        } else if (layout === 'masonry') {
            feedGrid.classList.add('masonry');
        }
        
        showNotification(`Layout changed to ${layout}`, 'info');
    }
}

async function loadMorePosts() {
    const loadMoreBtn = document.querySelector('.load-more-btn');
    
    if (loadMoreBtn) {
        const originalContent = loadMoreBtn.textContent;
        
        loadMoreBtn.innerHTML = '<div class="loading"></div> Loading...';
        loadMoreBtn.disabled = true;
        
        try {
            if (isConnected && accessToken && nextPageUrl) {
                // Load more real Instagram posts
                const mediaData = await fetchMoreInstagramMedia();
                
                if (mediaData.length > 0) {
                    const profile = await fetchInstagramProfile();
                    const newPosts = transformInstagramData(mediaData, profile);
                    posts = [...posts, ...newPosts];
                    
                    // Add new posts to the feed
                    const feedGrid = document.getElementById('feedGrid');
                    if (feedGrid) {
                        newPosts.forEach((post, index) => {
                            setTimeout(() => {
                                const postElement = createPostElement(post);
                                feedGrid.appendChild(postElement);
                            }, index * 100);
                        });
                    }
                    
                    showNotification(`Loaded ${newPosts.length} more posts!`, 'success');
                } else {
                    showNotification('No more posts to load', 'info');
                }
            } else {
                // Load more demo posts
                const newPosts = demoData.map(post => ({
                    ...post,
                    id: post.id + (currentPage * 1000),
                    timestamp: `${currentPage + 1} days ago`
                }));
                
                posts = [...posts, ...newPosts];
                currentPage++;
                
                // Add new posts to the feed
                const feedGrid = document.getElementById('feedGrid');
                if (feedGrid) {
                    newPosts.forEach((post, index) => {
                        setTimeout(() => {
                            const postElement = createPostElement(post);
                            feedGrid.appendChild(postElement);
                        }, index * 100);
                    });
                }
                
                showNotification('More demo posts loaded!', 'success');
            }
        } catch (error) {
            console.error('Error loading more posts:', error);
            showNotification('Failed to load more posts. Please try again.', 'error');
        } finally {
            loadMoreBtn.textContent = originalContent;
            loadMoreBtn.disabled = false;
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#c6f6d5' : type === 'error' ? '#fed7d7' : '#bee3f8'};
        color: ${type === 'success' ? '#2f855a' : type === 'error' ? '#c53030' : '#2b6cb0'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loading {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid #e2e8f0;
        border-radius: 50%;
        border-top-color: #667eea;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
`;
document.head.appendChild(style);

// Modal functions (if you have modals)
function showConnectModal() {
    const modal = document.getElementById('connectModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeConnectModal() {
    const modal = document.getElementById('connectModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function connectDemo() {
    loadDemoFeed();
    closeConnectModal();
    showNotification('Demo mode activated! Displaying sample Instagram feed.', 'success');
    
    const feedSection = document.getElementById('feed');
    if (feedSection) {
        feedSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleConnect(event) {
    event.preventDefault();
    
    const username = document.getElementById('username');
    const userAccessToken = document.getElementById('accessToken');
    
    if (username && userAccessToken) {
        if (!username.value || !userAccessToken.value) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        // Update access token and try to connect
        accessToken = userAccessToken.value;
        connectInstagram();
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('connectModal');
    if (modal && event.target === modal) {
        closeConnectModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeConnectModal();
    }
});

// Lazy loading for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', setupLazyLoading);
