
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Scanner;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONObject;

@WebServlet("/match")

public class MatchServlet extends HttpServlet {

    @Override
    protected void doPost(

        HttpServletRequest request,
        HttpServletResponse response

    ) throws ServletException, IOException {

        response.setContentType("application/json");

        PrintWriter out =
        response.getWriter();

        try {

            // =========================================
            // READ JSON INPUT FROM FRONTEND
            // =========================================

            Scanner sc =
            new Scanner(
                request.getInputStream()
            ).useDelimiter("\\A");

            String body =
            sc.hasNext()
            ? sc.next()
            : "";

            JSONObject data =
            new JSONObject(body);

            // =========================================
            // GET BOYS AND GIRLS DATA
            // =========================================

            JSONArray boys =
            data.getJSONArray("boys");

            JSONArray girls =
            data.getJSONArray("girls");

            // Stores simulation steps
            JSONArray steps =
            new JSONArray();

            // Stores final matches
            JSONArray matches =
            new JSONArray();

            // =========================================
            // GALE-SHAPLEY ALGORITHM INITIALIZATION
            // =========================================

            // Tracks if a girl already has a partner
            boolean[] girlTaken =
            new boolean[girls.length()];

            // Stores current partner of each girl
            String[] currentPartner =
            new String[girls.length()];

            // =========================================
            // GALE-SHAPLEY MATCHING ALGORITHM START
            // =========================================


            // next girl index each boy will propose to
            int[] nextProposal = new int[boys.length()];

            // free boys tracker
            boolean[] boyFree = new boolean[boys.length()];

            for (int i = 0; i < boys.length(); i++) {
                boyFree[i] = true;
            }

            boolean freeBoyExists = true;

            while (freeBoyExists) {

                freeBoyExists = false;

                for (int b = 0; b < boys.length(); b++) {

                    if (!boyFree[b]) {
                        continue;
                    }

                    freeBoyExists = true;

                    JSONObject boy =
                    boys.getJSONObject(b);

                    String boyName =
                    boy.getString("name");

                    JSONArray preferences =
                    boy.getJSONArray("preferences");

                    if (nextProposal[b] >= preferences.length()) {
                        continue;
                    }

                    String girlName =
                    preferences.getString(
                        nextProposal[b]
                    );

                    nextProposal[b]++;

                    int girlIndex = -1;

                    for (int g = 0; g < girls.length(); g++) {

                        if (
                            girls.getJSONObject(g)
                            .getString("name")
                            .equals(girlName)
                        ) {
                            girlIndex = g;
                            break;
                        }
                    }

                    if (girlIndex == -1) {
                        continue;
                    }

                    JSONObject proposal =
                    new JSONObject();

                    proposal.put(
                        "message",
                        boyName + " proposes to " + girlName
                    );

                    steps.put(proposal);

                    // girl is free
                    if (currentPartner[girlIndex] == null) {

                        currentPartner[girlIndex] =
                        boyName;

                        boyFree[b] = false;

                        JSONObject accept =
                        new JSONObject();

                        accept.put(
                            "message",
                            girlName + " accepts " + boyName
                        );

                        steps.put(accept);
                    }

                    // girl already has partner
                    else {

                        JSONObject girl =
                        girls.getJSONObject(girlIndex);

                        JSONArray girlPrefs =
                        girl.getJSONArray("preferences");

                        String currentBoy =
                        currentPartner[girlIndex];

                        int currentRank =
                        girlPrefs.length();

                        int newRank =
                        girlPrefs.length();

                        for (int p = 0; p < girlPrefs.length(); p++) {

                            String pref =
                            girlPrefs.getString(p);

                            if (pref.equals(currentBoy)) {
                                currentRank = p;
                            }

                            if (pref.equals(boyName)) {
                                newRank = p;
                            }
                        }

                        // prefers new boy
                        if (newRank < currentRank) {

                            int dumpedBoy = -1;

                            for (int x = 0; x < boys.length(); x++) {

                                if (
                                    boys.getJSONObject(x)
                                    .getString("name")
                                    .equals(currentBoy)
                                ) {

                                    dumpedBoy = x;
                                    break;
                                }
                            }

                            if (dumpedBoy != -1) {
                                boyFree[dumpedBoy] = true;
                            }

                            currentPartner[girlIndex] =
                            boyName;

                            boyFree[b] = false;

                            JSONObject swap =
                            new JSONObject();

                            swap.put(
                                "message",
                                girlName +
                                " prefers " +
                                boyName +
                                " over " +
                                currentBoy
                            );

                            steps.put(swap);
                        }

                        else {

                            JSONObject reject =
                            new JSONObject();

                            reject.put(
                                "message",
                                girlName +
                                " rejects " +
                                boyName
                            );

                            steps.put(reject);
                        }
                    }
                }
            }

            // =========================================
            // FINAL MATCHING RESULTS
            // =========================================

            for(int i = 0; i < girls.length(); i++){

                if(currentPartner[i] != null){

                    JSONObject match =
                    new JSONObject();

                    match.put(

                        "boy",

                        currentPartner[i]

                    );

                    match.put(

                        "girl",

                        girls.getJSONObject(i)
                        .getString("name")

                    );

                    matches.put(match);

                }

            }

            // =========================================
            // CREATE FINAL JSON RESPONSE
            // =========================================

            JSONObject result =
            new JSONObject();

            result.put(
                "steps",
                steps
            );

            result.put(
                "matches",
                matches
            );

            out.print(
                result.toString()
            );

        }

        catch(Exception e){

            // =========================================
            // ERROR HANDLING
            // =========================================

            JSONObject error =
            new JSONObject();

            error.put(
                "error",
                e.toString()
            );

            out.print(
                error.toString()
            );

        }

        out.flush();

    }

}

