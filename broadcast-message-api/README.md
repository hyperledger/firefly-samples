# broadcast-message-api

  This is a data-driven example to showcase the utility of the tag and topics metadata.

  Admittedly a very basic example.  

  The optional UI courtesy of Erica Calogero.

# 2 hypothetical scenarios

 * UI driven - Use the UI by Erica Calogera to construct a captured stock price and send it along.

 * Script driven - Use the bash script to see messages being broadcasted in action

          Example:
             
             $ broadcastMessages.sh data

# tag and topics utility

  Examine the json messages under data/

  Realize that the tag can be used to inform the recipient of the nature of the payload, i.e. a new stock price.

  Realize that the topics is an array.  Thus, the recipients can handle the message based upon the listed topics.  For example, aggregate the price of a stock symbol and hence, have a timeline of its fluctuations over time.  Alternatively, aggregate the messages by date. 

# caveats

  This collaboration with Erica was under a time limit.  We are doing a PR as part of OSD at vGHC2021.



