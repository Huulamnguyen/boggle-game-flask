from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle


class FlaskTests(TestCase):

    # TODO -- write tests for every view function / feature!
    def setUp(self):
        """Need to do before every test"""

        self.client = app.test_client()
        app.config['TESTING'] = True
    
    def test_homepage(self):
        """Make sure information is in the session and HTML is displayed"""
        with app.test_client() as client:
            resp = client.get('/')

            self.assertEqual(resp.status_code, 200)
            self.assertIn('board', session)
            self.assertIsNone(session.get('highscore'))
            self.assertIsNone(session.get('nplays'))
            self.assertIn(b'<p>High Score:', resp.data)
            self.assertIn(b'Score:', resp.data)
            self.assertIn(b'Seconds Left:', resp.data)


    def test_valid_word(self):
        """Test if word is valid by modifying the board in the session"""
        with app.test_client() as client:
            with client.session_transaction() as session:
                session['board'] = [["C", "A", "T", "T", "T"], 
                                    ["C", "A", "T", "T", "T"], 
                                    ["C", "A", "T", "T", "T"], 
                                    ["C", "A", "T", "T", "T"], 
                                    ["C", "A", "T", "T", "T"]]

            resp = client.get('/check-word?word=cat')
            self.assertEqual(resp.json['result'], 'ok')

    def test_invalid_word(self):
        """Test if the word is or is not in the dictionary"""

        self.client.get('/')
        response = self.client.get('/check-word?word=impossible')
        self.assertEqual(response.json['result'], 'not-on-board')
    
    def non_english_word(self):
        """Test if word is on the board"""

        self.client.get('/')
        response = self.client.get(
            '/check-word?word=fsjdakfkldsfjdslkfjdlksf')
        self.assertEqual(response.json['result'], 'not-word')