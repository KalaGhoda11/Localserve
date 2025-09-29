from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit, join_room
import json
import math
from datetime import datetime, timedelta
import random
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import base64

app = Flask(__name__)
app.config['SECRET_KEY'] = 'localserve_secret_key'
socketio = SocketIO(app, cors_allowed_origins="*")

# Store data in memory
active_requests = []
new_requests_queue = []
booking_history = []
messages = []
provider_earnings_history = []
provider_schedule = {}
provider_profiles = {}
notifications = []

# Provider data with enhanced information
PROVIDERS = [
    {
        "id": 1,
        "name": "John's Electricals",
        "service": "Electrician",
        "rating": 4.8,
        "reviews": 127,
        "lat": 12.9716,
        "lng": 77.5946,
        "price": "₹500-800",
        "phone": "+91 98765 43210",
        "email": "john@electricals.com",
        "services": ["Installation", "Repair", "Products", "Wiring", "Appliance Repair"],
        "working_hours": {"start": "09:00", "end": "18:00"},
        "availability": "available",
        "profile_image": "https://via.placeholder.com/150",
        "description": "Professional electrician with 10+ years experience",
        "certifications": ["Licensed Electrician", "Safety Certified"],
        "completed_jobs": 156,
        "response_time": "15 mins",
        "bio": "Expert in residential and commercial electrical work",
        "address": "Indiranagar, Bangalore",
        "years_experience": 10,
        "languages": ["English", "Hindi", "Kannada"],
        "gallery": [
            "https://via.placeholder.com/400x300",
            "https://via.placeholder.com/400x300",
            "https://via.placeholder.com/400x300"
        ]
    },
    {
        "id": 2,
        "name": "QuickFix Plumbing",
        "service": "Plumber",
        "rating": 4.6,
        "reviews": 89,
        "lat": 12.9750,
        "lng": 77.5980,
        "price": "₹400-700",
        "phone": "+91 98765 43211",
        "email": "quickfix@plumbing.com",
        "services": ["Repair", "Installation", "Pipe Fitting", "Tank Cleaning"],
        "working_hours": {"start": "08:00", "end": "20:00"},
        "availability": "available",
        "profile_image": "https://via.placeholder.com/150",
        "description": "Fast and reliable plumbing services",
        "certifications": ["Certified Plumber"],
        "completed_jobs": 89,
        "response_time": "20 mins",
        "bio": "24/7 emergency plumbing services",
        "address": "Koramangala, Bangalore",
        "years_experience": 8,
        "languages": ["English", "Hindi"],
        "gallery": [
            "https://via.placeholder.com/400x300",
            "https://via.placeholder.com/400x300"
        ]
    },
    {
        "id": 3,
        "name": "SparkPro Electric",
        "service": "Electrician",
        "rating": 4.9,
        "reviews": 203,
        "lat": 12.9700,
        "lng": 77.5900,
        "price": "₹600-1000",
        "phone": "+91 98765 43212",
        "email": "spark@pro.com",
        "services": ["Installation", "Repair", "Products", "Industrial Wiring"],
        "working_hours": {"start": "07:00", "end": "19:00"},
        "availability": "available",
        "profile_image": "https://via.placeholder.com/150",
        "description": "Premium electrical services and installations",
        "certifications": ["Master Electrician", "Industrial Certified"],
        "completed_jobs": 203,
        "response_time": "10 mins",
        "bio": "Specialized in industrial and commercial installations",
        "address": "Whitefield, Bangalore",
        "years_experience": 12,
        "languages": ["English", "Hindi", "Kannada", "Tamil"],
        "gallery": [
            "https://via.placeholder.com/400x300",
            "https://via.placeholder.com/400x300",
            "https://via.placeholder.com/400x300",
            "https://via.placeholder.com/400x300"
        ]
    }
]

# Initialize provider profiles
for provider in PROVIDERS:
    provider_profiles[provider['id']] = {**provider}

# Generate sample earnings data
def generate_earnings_data():
    today = datetime.now()
    for i in range(30):
        date = today - timedelta(days=i)
        if random.random() > 0.3:
            provider_earnings_history.append({
                'date': date.strftime('%Y-%m-%d'),
                'amount': random.randint(500, 3000),
                'service': random.choice(['Installation', 'Repair', 'Products']),
                'customer': f'Customer {random.randint(1, 100)}'
            })

generate_earnings_data()

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in km"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_provider')
def handle_join_provider(data):
    provider_id = data.get('provider_id')
    join_room(f'provider_{provider_id}')
    emit('joined', {'message': f'Joined provider room {provider_id}'})

@socketio.on('join_consumer')
def handle_join_consumer(data):
    consumer_id = data.get('consumer_id')
    join_room(f'consumer_{consumer_id}')
    emit('joined', {'message': f'Joined consumer room {consumer_id}'})

@socketio.on('send_message')
def handle_message(data):
    message = {
        'id': len(messages) + 1,
        'request_id': data.get('request_id'),
        'sender': data.get('sender'),
        'message': data.get('message'),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    messages.append(message)
    
    # Emit to the chat room
    socketio.emit('new_message', message, room=f"chat_{data.get('request_id')}")

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    return render_template('search.html')

@app.route('/consumer/bookings')
def consumer_bookings():
    return render_template('consumer_bookings.html')

@app.route('/provider/dashboard')
def provider_dashboard():
    return render_template('provider_dashboard.html')

@app.route('/provider/profile')
def provider_profile():
    return render_template('provider_profile.html')

@app.route('/provider/settings')
def provider_settings():
    return render_template('provider_settings.html')

@app.route('/api/search')
def api_search():
    service_type = request.args.get('service', '')
    user_lat = float(request.args.get('lat', 12.9716))
    user_lng = float(request.args.get('lng', 77.5946))
    radius = float(request.args.get('radius', 1.0))
    
    results = []
    for provider in PROVIDERS:
        if service_type and provider['service'].lower() != service_type.lower():
            continue
        distance = calculate_distance(user_lat, user_lng, provider['lat'], provider['lng'])
        if distance <= radius:
            provider_copy = provider.copy()
            provider_copy['distance'] = distance
            results.append(provider_copy)
    
    results.sort(key=lambda x: x['distance'])
    return jsonify({'providers': results, 'radius_used': radius, 'count': len(results)})

@app.route('/api/providers')
def get_all_providers():
    return jsonify(PROVIDERS)

@app.route('/api/provider/<int:provider_id>')
def get_provider_details(provider_id):
    """Get detailed provider profile"""
    provider = next((p for p in PROVIDERS if p['id'] == provider_id), None)
    if provider:
        # Get recent reviews
        recent_reviews = [r for r in booking_history if r.get('provider_id') == provider_id and r.get('review')][-5:]
        provider_data = {**provider}
        provider_data['recent_reviews'] = recent_reviews
        return jsonify(provider_data)
    return jsonify({'error': 'Provider not found'}), 404

@app.route('/api/booking/request', methods=['POST'])
def create_booking_request():
    data = request.json
    booking_request = {
        'id': len(active_requests) + len(booking_history) + 1,
        'customer_name': data.get('customer_name', 'Anonymous Customer'),
        'customer_id': data.get('customer_id', 'consumer_1'),
        'provider_id': data.get('provider_id'),
        'provider_name': data.get('provider_name'),
        'service_type': data.get('service_type'),
        'service': data.get('service'),
        'distance': data.get('distance'),
        'budget': data.get('budget'),
        'details': data.get('details', 'Service requested'),
        'customer_phone': data.get('customer_phone', '+91 99999 99999'),
        'customer_lat': data.get('customer_lat'),
        'customer_lng': data.get('customer_lng'),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'time_ago': 'Just now',
        'status': 'pending',
        'job_status': None,
        'payment_status': 'unpaid',
        'rating': None,
        'review': None,
        'can_cancel': True,
        'can_reschedule': False
    }
    
    active_requests.append(booking_request)
    new_requests_queue.append(booking_request)
    
    # Send WebSocket notification to provider
    socketio.emit('new_request', booking_request, room=f"provider_{data.get('provider_id')}")
    
    return jsonify({
        'success': True,
        'message': 'Booking request sent to provider',
        'request_id': booking_request['id']
    })

@app.route('/api/provider/requests')
def get_provider_requests():
    pending = [r for r in active_requests if r['status'] == 'pending']
    return jsonify(pending)

@app.route('/api/provider/accept-request', methods=['POST'])
def accept_request():
    data = request.json
    request_id = data.get('request_id')
    provider_data = data.get('provider_data', {})
    
    for req in active_requests:
        if req['id'] == request_id:
            req['status'] = 'accepted'
            req['job_status'] = 'accepted'
            req['accepted_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            req['provider_details'] = provider_data
            req['can_cancel'] = False
            req['can_reschedule'] = True
            
            # Send WebSocket notification to consumer
            socketio.emit('request_accepted', {
                'request_id': request_id,
                'provider_details': provider_data
            }, room=f"consumer_{req.get('customer_id', 'consumer_1')}")
            
            break
    
    return jsonify({'success': True, 'message': 'Request accepted'})

@app.route('/api/provider/reject-request', methods=['POST'])
def reject_request():
    data = request.json
    request_id = data.get('request_id')
    
    for req in active_requests:
        if req['id'] == request_id:
            req['status'] = 'rejected'
            
            # Notify consumer
            socketio.emit('request_rejected', {
                'request_id': request_id
            }, room=f"consumer_{req.get('customer_id', 'consumer_1')}")
            
            break
    
    return jsonify({'success': True, 'message': 'Request rejected'})

@app.route('/api/consumer/check-status/<int:request_id>')
def check_request_status(request_id):
    for req in active_requests:
        if req['id'] == request_id:
            return jsonify({
                'status': req['status'],
                'job_status': req.get('job_status'),
                'provider_details': req.get('provider_details', {})
            })
    return jsonify({'status': 'not_found'})

@app.route('/api/job/update-status', methods=['POST'])
def update_job_status():
    """Provider updates job status"""
    data = request.json
    request_id = data.get('request_id')
    new_status = data.get('status')
    
    for req in active_requests:
        if req['id'] == request_id:
            req['job_status'] = new_status
            if new_status == 'completed':
                req['completed_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Notify consumer via WebSocket
            socketio.emit('job_status_update', {
                'request_id': request_id,
                'status': new_status
            }, room=f"consumer_{req.get('customer_id', 'consumer_1')}")
            
            return jsonify({'success': True, 'message': f'Job status updated to {new_status}'})
    
    return jsonify({'success': False, 'message': 'Request not found'})

@app.route('/api/booking/reschedule', methods=['POST'])
def reschedule_booking():
    """Reschedule a booking"""
    data = request.json
    request_id = data.get('request_id')
    new_date = data.get('new_date')
    new_time = data.get('new_time')
    
    for req in active_requests:
        if req['id'] == request_id and req.get('can_reschedule', False):
            req['rescheduled_date'] = new_date
            req['rescheduled_time'] = new_time
            req['rescheduled_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Notify provider
            socketio.emit('booking_rescheduled', {
                'request_id': request_id,
                'new_date': new_date,
                'new_time': new_time
            }, room=f"provider_{req.get('provider_id')}")
            
            return jsonify({'success': True, 'message': 'Booking rescheduled successfully'})
    
    return jsonify({'success': False, 'message': 'Cannot reschedule this booking'})

@app.route('/api/booking/cancel', methods=['POST'])
def cancel_booking():
    """Cancel a booking request"""
    data = request.json
    request_id = data.get('request_id')
    reason = data.get('reason', 'No reason provided')
    
    for req in active_requests:
        if req['id'] == request_id and req.get('can_cancel', True):
            req['status'] = 'cancelled'
            req['cancellation_reason'] = reason
            req['cancelled_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            # Notify provider
            socketio.emit('booking_cancelled', {
                'request_id': request_id,
                'reason': reason
            }, room=f"provider_{req.get('provider_id')}")
            
            return jsonify({'success': True, 'message': 'Booking cancelled'})
    
    return jsonify({'success': False, 'message': 'Cannot cancel this booking'})

@app.route('/api/consumer/my-bookings')
def get_consumer_bookings():
    """Get all bookings for consumer"""
    return jsonify(active_requests + booking_history)

@app.route('/api/payment/process', methods=['POST'])
def process_payment():
    """Process payment after job completion"""
    data = request.json
    request_id = data.get('request_id')
    amount = data.get('amount')
    
    for req in active_requests:
        if req['id'] == request_id:
            req['payment_status'] = 'paid'
            req['payment_amount'] = amount
            req['payment_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            req['receipt_id'] = f'RCP{request_id}{datetime.now().strftime("%Y%m%d%H%M")}'
            
            provider_earnings_history.append({
                'date': datetime.now().strftime('%Y-%m-%d'),
                'amount': int(amount),
                'service': req['service_type'],
                'customer': req['customer_name']
            })
            
            # Notify provider
            socketio.emit('payment_received', {
                'request_id': request_id,
                'amount': amount
            }, room=f"provider_{req.get('provider_id')}")
            
            return jsonify({
                'success': True, 
                'message': 'Payment successful', 
                'receipt_id': req['receipt_id']
            })
    
    return jsonify({'success': False, 'message': 'Request not found'})

@app.route('/api/payment/receipt/<int:request_id>')
def get_receipt(request_id):
    """Get payment receipt details"""
    for req in active_requests + booking_history:
        if req['id'] == request_id and req.get('payment_status') == 'paid':
            receipt = {
                'receipt_id': req.get('receipt_id'),
                'date': req.get('payment_at'),
                'customer_name': req['customer_name'],
                'provider_name': req['provider_name'],
                'service': req['service_type'],
                'amount': req.get('payment_amount'),
                'status': 'Paid'
            }
            return jsonify(receipt)
    
    return jsonify({'error': 'Receipt not found'}), 404

@app.route('/api/payment/receipt/<int:request_id>/pdf')
def download_receipt_pdf(request_id):
    """Generate and download PDF receipt"""
    for req in active_requests + booking_history:
        if req['id'] == request_id and req.get('payment_status') == 'paid':
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            
            # Add content to PDF
            p.setFont("Helvetica-Bold", 20)
            p.drawString(100, 750, "LocalServe - Payment Receipt")
            
            p.setFont("Helvetica", 12)
            p.drawString(100, 700, f"Receipt ID: {req.get('receipt_id')}")
            p.drawString(100, 680, f"Date: {req.get('payment_at')}")
            p.drawString(100, 660, f"Customer: {req['customer_name']}")
            p.drawString(100, 640, f"Provider: {req['provider_name']}")
            p.drawString(100, 620, f"Service: {req['service_type']}")
            p.drawString(100, 600, f"Amount Paid: ₹{req.get('payment_amount')}")
            p.drawString(100, 580, f"Status: Paid")
            
            p.showPage()
            p.save()
            
            buffer.seek(0)
            pdf_data = base64.b64encode(buffer.read()).decode()
            
            return jsonify({
                'success': True,
                'pdf_data': pdf_data,
                'filename': f'receipt_{req.get("receipt_id")}.pdf'
            })
    
    return jsonify({'error': 'Receipt not found'}), 404

@app.route('/api/rating/submit', methods=['POST'])
def submit_rating():
    """Consumer submits rating and review"""
    data = request.json
    request_id = data.get('request_id')
    rating = data.get('rating')
    review = data.get('review')
    
    for req in active_requests:
        if req['id'] == request_id:
            req['rating'] = rating
            req['review'] = review
            req['rated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            booking_history.append(req)
            active_requests.remove(req)
            
            provider_id = req['provider_id']
            for provider in PROVIDERS:
                if provider['id'] == provider_id:
                    total_reviews = provider['reviews']
                    current_rating = provider['rating']
                    new_rating = ((current_rating * total_reviews) + rating) / (total_reviews + 1)
                    provider['rating'] = round(new_rating, 1)
                    provider['reviews'] += 1
                    break
            
            return jsonify({'success': True, 'message': 'Rating submitted successfully'})
    
    return jsonify({'success': False, 'message': 'Request not found'})

@app.route('/api/messages/send', methods=['POST'])
def send_message():
    """Send a message"""
    data = request.json
    message = {
        'id': len(messages) + 1,
        'request_id': data.get('request_id'),
        'sender': data.get('sender'),
        'message': data.get('message'),
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }
    messages.append(message)
    
    # Emit via WebSocket
    socketio.emit('new_message', message, room=f"chat_{data.get('request_id')}")
    
    return jsonify({'success': True, 'message_id': message['id']})

@app.route('/api/messages/<int:request_id>')
def get_messages(request_id):
    """Get all messages for a request"""
    request_messages = [m for m in messages if m['request_id'] == request_id]
    return jsonify(request_messages)

@app.route('/api/provider/earnings')
def get_provider_earnings():
    """Get earnings data for charts"""
    period = request.args.get('period', 'weekly')
    today = datetime.now()
    
    if period == 'weekly':
        days = 7
        data = []
        for i in range(days):
            date = today - timedelta(days=days-1-i)
            date_str = date.strftime('%Y-%m-%d')
            day_earnings = sum([e['amount'] for e in provider_earnings_history if e['date'] == date_str])
            data.append({
                'date': date.strftime('%a'),
                'amount': day_earnings
            })
    else:  # monthly
        days = 30
        data = []
        for i in range(days):
            date = today - timedelta(days=days-1-i)
            date_str = date.strftime('%Y-%m-%d')
            day_earnings = sum([e['amount'] for e in provider_earnings_history if e['date'] == date_str])
            if day_earnings > 0:
                data.append({
                    'date': date.strftime('%d %b'),
                    'amount': day_earnings
                })
    
    total_today = sum([e['amount'] for e in provider_earnings_history if e['date'] == today.strftime('%Y-%m-%d')])
    total_period = sum([d['amount'] for d in data])
    
    return jsonify({
        'data': data,
        'total_today': total_today,
        'total_period': total_period,
        'period': period
    })

@app.route('/api/provider/stats')
def get_provider_stats():
    """Get provider statistics"""
    provider_id = request.args.get('provider_id', 1, type=int)
    provider = next((p for p in PROVIDERS if p['id'] == provider_id), PROVIDERS[0])
    
    completed = [r for r in booking_history if r.get('provider_id') == provider_id]
    total_earnings = sum([e['amount'] for e in provider_earnings_history])
    avg_rating = provider['rating']
    
    service_counts = {}
    for req in completed:
        service = req.get('service_type', 'Other')
        service_counts[service] = service_counts.get(service, 0) + 1
    
    return jsonify({
        'total_jobs': provider['completed_jobs'],
        'total_earnings': total_earnings,
        'average_rating': avg_rating,
        'total_reviews': provider['reviews'],
        'service_breakdown': service_counts,
        'response_time': provider.get('response_time', '15 mins')
    })

@app.route('/api/provider/schedule', methods=['GET', 'POST'])
def provider_schedule_api():
    """Get or update provider schedule"""
    provider_id = request.args.get('provider_id', 1, type=int)
    
    if request.method == 'POST':
        data = request.json
        provider_schedule[provider_id] = data
        
        for provider in PROVIDERS:
            if provider['id'] == provider_id:
                provider['working_hours'] = {
                    'start': data.get('start_time'),
                    'end': data.get('end_time')
                }
                break
        
        return jsonify({'success': True, 'message': 'Schedule updated'})
    
    schedule = provider_schedule.get(provider_id, {
        'start_time': '09:00',
        'end_time': '18:00',
        'holidays': []
    })
    return jsonify(schedule)

@app.route('/api/provider/profile', methods=['GET', 'PUT'])
def provider_profile_api():
    """Get or update provider profile"""
    provider_id = request.args.get('provider_id', 1, type=int)
    
    if request.method == 'PUT':
        data = request.json
        
        for provider in PROVIDERS:
            if provider['id'] == provider_id:
                provider.update({
                    'name': data.get('name', provider['name']),
                    'phone': data.get('phone', provider['phone']),
                    'email': data.get('email', provider['email']),
                    'description': data.get('description', provider['description']),
                    'price': data.get('price', provider['price']),
                    'services': data.get('services', provider['services']),
                    'bio': data.get('bio', provider.get('bio')),
                    'address': data.get('address', provider.get('address')),
                    'years_experience': data.get('years_experience', provider.get('years_experience'))
                })
                break
        
        if provider_id in provider_profiles:
            provider_profiles[provider_id].update(data)
        
        return jsonify({'success': True, 'message': 'Profile updated successfully'})
    
    profile = provider_profiles.get(provider_id, {})
    return jsonify(profile)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 LocalServe Server Started!")
    print("="*60)
    print("\n📱 Access URLs:")
    print(f"   Local:     http://127.0.0.1:5000")
    print("\n📋 Pages:")
    print("   Consumer Search:     /search")
    print("   Consumer Bookings:   /consumer/bookings")
    print("   Provider Dashboard:  /provider/dashboard")
    print("   Provider Settings:   /provider/settings")
    print("\n" + "="*60 + "\n")
    
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)