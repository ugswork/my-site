// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio App RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

/**
 * Add here all the overridden components of your app.
 */

import { i18next } from "@translations/invenio_requests/i18next";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { Image } from "react-invenio-forms";
import { Container, Dropdown, Feed } from "semantic-ui-react";
import { CancelButton, SaveButton } from "@js/invenio_requests/components/Buttons";
import Error from "@js/invenio_requests/components/Error";
import FormattedInputEditor from "@js/invenio_requests/components/FormattedInputEditor";
import RequestsFeed from "@js/invenio_requests/components/RequestsFeed";
import { TimelineEventBody } from "@js/invenio_requests/components/TimelineEventBody";
import { timestampToRelativeTime } from "@js/invenio_requests/utils";

class TimelineCommentEvent extends Component {
  constructor(props) {
    super(props);

    const { event } = props;

    this.state = {
      commentContent: event?.payload?.content,
    };
  }

  eventToType = ({ type, payload }) => {
    switch (type) {
      case "L":
        return payload?.event || "unknown";
      case "C":
        return "comment";
      default:
        return "unknown";
    }
  };

  render() {
    const {
      isLoading,
      isEditing,
      error,
      event,
      updateComment,
      deleteComment,
      toggleEditMode,
    } = this.props;
    const { commentContent } = this.state;

    const commentHasBeenEdited = event?.revision_id > 1 && event?.payload;

    const canDelete = event?.permissions?.can_delete_comment;
    const canUpdate = event?.permissions?.can_update_comment;

    const createdBy = event.created_by;
    const isUser = "user" in createdBy;
    const expandedCreatedBy = event.expanded?.created_by;

    let userAvatar,
      userName = null;
    if (isUser) {
      userAvatar = (
        <RequestsFeed.Avatar
          src={expandedCreatedBy.links.avatar}
          as={Image}
          circular
        />
      );
      userName =
        expandedCreatedBy.profile?.full_name || expandedCreatedBy.username;
    }

    return (
      <div
        id={`TimelineEvent.layout.${this.eventToType(event)}`}
        event={event}
      >
        <RequestsFeed.Item>
          <RequestsFeed.Content>
            {userAvatar}
            <RequestsFeed.Event>
              <Feed.Content>
                {(canDelete || canUpdate) && (
                  <Dropdown
                    icon="ellipsis horizontal"
                    className="right-floated"
                    direction="left"
                  >
                    <Dropdown.Menu>
                      {canUpdate && (
                        <Dropdown.Item onClick={() => toggleEditMode()}>
                          {i18next.t("MySiteEdit")}
                        </Dropdown.Item>
                      )}
                      {canDelete && (
                        <Dropdown.Item onClick={() => deleteComment()}>
                          {i18next.t("MySiteDelete")}
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                <Feed.Summary>
                  <b>{userName}</b>
                  <Feed.Date>
                    {i18next.t("MySitecommented")}{" "}
                    {timestampToRelativeTime(event.created)}
                  </Feed.Date>
                </Feed.Summary>

                <Feed.Extra text={!isEditing}>
                  {error && <Error error={error} />}

                  {isEditing ? (
                    <FormattedInputEditor
                      data={event?.payload?.content}
                      onChange={(event, editor) =>
                        this.setState({ commentContent: editor.getData() })
                      }
                      minHeight="100%"
                    />
                  ) : (
                    <TimelineEventBody
                      content={event?.payload?.content}
                      format={event?.payload?.format}
                    />
                  )}

                  {isEditing && (
                    <Container fluid className="mt-15" textAlign="right">
                      <CancelButton onClick={() => toggleEditMode()} />
                      <SaveButton
                        onClick={() => updateComment(commentContent, "html")}
                        loading={isLoading}
                      />
                    </Container>
                  )}
                </Feed.Extra>
                {commentHasBeenEdited && (
                  <Feed.Meta>{i18next.t("MySiteEdited")}</Feed.Meta>
                )}
              </Feed.Content>
            </RequestsFeed.Event>
          </RequestsFeed.Content>
        </RequestsFeed.Item>
      </div>
    );
  }
}

export default TimelineCommentEvent;

TimelineCommentEvent.propTypes = {
  event: PropTypes.object.isRequired,
  deleteComment: PropTypes.func.isRequired,
  updateComment: PropTypes.func.isRequired,
  toggleEditMode: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isEditing: PropTypes.bool,
  error: PropTypes.string,
};

TimelineCommentEvent.defaultProps = {
  isLoading: false,
  isEditing: false,
  error: undefined,
};

// export default Overridable.component("TimelineEvent", TimelineCommentEvent);

export const overriddenComponents = {
      "TimelineEvent.layout": TimelineCommentEvent,
};



