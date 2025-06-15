
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, MapPin, ArrowRight, Download, Ticket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useTickets } from '@/hooks/useTickets';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(true);
  const [eventDetails, setEventDetails] = useState(null);
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const { tickets, downloadTicket, isDownloading } = useTickets();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        toast({
          title: "Invalid Payment Session",
          description: "No payment session found.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId },
        });

        if (error) throw error;

        if (data.success) {
          // Fetch event details
          const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', data.eventId)
            .single();

          if (eventError) throw eventError;

          // Fetch purchase details
          const { data: purchase, error: purchaseError } = await supabase
            .from('event_purchases')
            .select('*')
            .eq('id', data.purchaseId)
            .single();

          if (purchaseError) throw purchaseError;

          setEventDetails(event);
          setPurchaseDetails(purchase);
          
          toast({
            title: "Payment Successful!",
            description: "Your ticket has been confirmed and generated.",
          });
        } else {
          throw new Error(data.error || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Payment Verification Failed",
          description: "There was an issue verifying your payment. Please contact support.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  // Find the ticket for this event
  const eventTicket = eventDetails && tickets ? 
    tickets.find(ticket => ticket.event_id === eventDetails.id) : null;

  if (verifying) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your purchase and generate your ticket.</p>
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!eventDetails || !purchaseDetails) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
          <h1 className="text-2xl font-bold mb-4">Payment Error</h1>
          <p className="text-muted-foreground mb-6">
            We couldn't verify your payment. Please contact support if you were charged.
          </p>
          <Button onClick={() => navigate('/')}>Return Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-lg text-muted-foreground">
            Your ticket has been confirmed and generated!
          </p>
        </div>

        {/* Ticket Download Card */}
        {eventTicket && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Ticket className="w-5 h-5" />
                Your Ticket is Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-600 mb-4">
                Your digital ticket has been automatically generated and is ready for download.
              </p>
              <Button 
                onClick={() => downloadTicket(eventTicket.id)}
                disabled={isDownloading}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloading ? 'Generating PDF...' : 'Download Ticket PDF'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Event Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{eventDetails.title}</h3>
              <p className="text-muted-foreground">{eventDetails.short_description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-muted-foreground">
                  {new Date(eventDetails.event_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              
              <div>
                <p className="font-medium">Location</p>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {eventDetails.location}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Purchase Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Ticket Quantity:</span>
              <span>{purchaseDetails.ticket_quantity}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span className="font-semibold">${purchaseDetails.amount_paid / 100}</span>
            </div>
            <div className="flex justify-between">
              <span>Purchase Date:</span>
              <span>{new Date(purchaseDetails.purchase_date).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => navigate(`/events/${eventDetails.id}`)}
            className="flex-1"
          >
            View Event Details
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/my-tickets')}
            className="flex-1"
          >
            View All Tickets
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            📧 A confirmation email with your ticket details has been sent to your email address.
            You can also download your ticket anytime from the "My Tickets" section.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentSuccess;
